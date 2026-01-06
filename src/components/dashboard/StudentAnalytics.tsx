import { useState, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Flame,
  Award,
  BookOpen,
  Target,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StudentAnalyticsProps {
  userId: string;
}

interface AnalyticsData {
  totalTimeStudied: number;
  lessonsCompleted: number;
  totalLessons: number;
  activeDays: number;
  currentStreak: number;
  avgProgressPerCourse: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  weeklyActivity: { day: string; count: number }[];
}

const StatCard = memo(({ 
  icon: Icon, 
  value, 
  label, 
  sublabel,
  color, 
  delay 
}: { 
  icon: any; 
  value: number | string; 
  label: string; 
  sublabel?: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="p-4 h-full hover:shadow-lg transition-shadow border-border/50">
      <div className="flex items-start gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sublabel && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
    </Card>
  </motion.div>
));

StatCard.displayName = "StatCard";

export const StudentAnalytics = memo(({ userId }: StudentAnalyticsProps) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalTimeStudied: 0,
    lessonsCompleted: 0,
    totalLessons: 0,
    activeDays: 0,
    currentStreak: 0,
    avgProgressPerCourse: 0,
    coursesEnrolled: 0,
    coursesCompleted: 0,
    weeklyActivity: [],
  });

  const loadAnalytics = useCallback(async () => {
    try {
      // Get completed lessons
      const { data: progressData, count: completedCount } = await supabase
        .from("user_progress")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("completed", true);

      // Get total available lessons
      const { count: totalLessonsCount } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from("user_courses")
        .select("course_id, courses (id, title)")
        .eq("user_id", userId)
        .eq("status", "enrolled");

      // Calculate courses completed
      const coursesPromises = (enrollments || []).map(async (enrollment: any) => {
        const course = enrollment.courses;
        if (!course) return { completed: false };

        const { data: modules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", course.id)
          .eq("is_active", true);

        const moduleIds = (modules || []).map(m => m.id);
        
        if (moduleIds.length === 0) return { completed: false };

        const { count: lessonCount } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .in("module_id", moduleIds);

        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("is_active", true)
          .in("module_id", moduleIds);

        const lessonIds = (lessons || []).map(l => l.id);

        const { count: completedLessons } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("completed", true)
          .in("lesson_id", lessonIds.length > 0 ? lessonIds : [""]);

        const progress = lessonCount && lessonCount > 0 
          ? ((completedLessons || 0) / lessonCount) * 100 
          : 0;

        return { completed: progress >= 100 };
      });

      const coursesResults = await Promise.all(coursesPromises);
      const completedCourses = coursesResults.filter(c => c.completed).length;

      // Calculate active days from completed_at timestamps
      const activeDaysSet = new Set<string>();
      (progressData || []).forEach((p: any) => {
        if (p.completed_at) {
          const date = new Date(p.completed_at).toISOString().split('T')[0];
          activeDaysSet.add(date);
        }
      });

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (activeDaysSet.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Weekly activity
      const weeklyActivity = [];
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];
        
        const count = (progressData || []).filter((p: any) => {
          if (!p.completed_at) return false;
          return new Date(p.completed_at).toISOString().split('T')[0] === dateStr;
        }).length;

        weeklyActivity.push({ day: dayName, count });
      }

      // Calculate average progress
      const avgProgress = enrollments && enrollments.length > 0
        ? ((completedCount || 0) / Math.max(totalLessonsCount || 1, 1)) * 100
        : 0;

      setAnalytics({
        totalTimeStudied: (completedCount || 0) * 12, // Estimate 12 min per lesson
        lessonsCompleted: completedCount || 0,
        totalLessons: totalLessonsCount || 0,
        activeDays: activeDaysSet.size,
        currentStreak: streak,
        avgProgressPerCourse: Math.round(avgProgress),
        coursesEnrolled: enrollments?.length || 0,
        coursesCompleted: completedCourses,
        weeklyActivity,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  const completionPercentage = analytics.totalLessons > 0
    ? Math.round((analytics.lessonsCompleted / analytics.totalLessons) * 100)
    : 0;

  return (
    <Card className="p-6 bg-card/50">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Tu Progreso de Aprendizaje</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Clock}
          value={`${Math.round(analytics.totalTimeStudied / 60)}h`}
          label="Tiempo estudiado"
          sublabel={`${analytics.totalTimeStudied} minutos`}
          color="bg-primary/10 text-primary"
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          value={analytics.lessonsCompleted}
          label="Lecciones completadas"
          sublabel={`de ${analytics.totalLessons} totales`}
          color="bg-emerald-500/10 text-emerald-500"
          delay={0.05}
        />
        <StatCard
          icon={Flame}
          value={analytics.currentStreak}
          label="Racha actual"
          sublabel="días consecutivos"
          color="bg-amber-500/10 text-amber-500"
          delay={0.1}
        />
        <StatCard
          icon={Calendar}
          value={analytics.activeDays}
          label="Días activos"
          sublabel="días de estudio"
          color="bg-violet-500/10 text-violet-500"
          delay={0.15}
        />
      </div>

      {/* Progress Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Progreso General</span>
            </div>
            <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{analytics.lessonsCompleted} completadas</span>
            <span>{analytics.totalLessons - analytics.lessonsCompleted} restantes</span>
          </div>
        </motion.div>

        {/* Course Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Cursos</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{analytics.coursesEnrolled}</span>
              </div>
              <p className="text-xs text-muted-foreground">Inscritos</p>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-emerald-500" />
                <span className="text-2xl font-bold">{analytics.coursesCompleted}</span>
              </div>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 pt-6 border-t border-border/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Actividad de la semana</span>
        </div>
        <div className="flex gap-2">
          {analytics.weeklyActivity.map((day, idx) => (
            <div key={idx} className="flex-1 text-center">
              <div 
                className={cn(
                  "h-8 rounded-md mb-1 transition-colors",
                  day.count === 0 
                    ? "bg-muted/30" 
                    : day.count === 1
                      ? "bg-primary/30"
                      : day.count === 2
                        ? "bg-primary/50"
                        : "bg-primary"
                )}
              />
              <span className="text-xs text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {analytics.weeklyActivity.reduce((acc, d) => acc + d.count, 0)} lecciones esta semana
        </p>
      </motion.div>
    </Card>
  );
});

StudentAnalytics.displayName = "StudentAnalytics";
