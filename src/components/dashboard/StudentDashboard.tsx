import { useState, useEffect, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  GraduationCap,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { StudentAnalytics } from "@/components/dashboard/StudentAnalytics";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getHumanProgressMessage, getEncouragementMessage } from "@/utils/progressMessages";

interface EnrolledCourse {
  id: string;
  title: string;
  image_url: string | null;
  level: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
}

interface RecentActivity {
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  completed_at: string;
}

interface StudentDashboardProps {
  userId: string;
}

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  delay 
}: { 
  icon: any; 
  value: number | string; 
  label: string; 
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <Card className="p-5 border-border/50 hover:border-primary/30 transition-all h-full">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const CourseCard = memo(({ 
  course, 
  index,
  onContinue,
  onViewCourse
}: { 
  course: EnrolledCourse; 
  index: number;
  onContinue: (id: string) => void;
  onViewCourse: (id: string) => void;
}) => {
  const isComplete = course.progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Card 
        className="overflow-hidden border-border/50 hover:border-primary/30 transition-all group cursor-pointer h-full flex flex-col"
        onClick={() => onViewCourse(course.id)}
      >
        <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <GraduationCap className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {isComplete && (
            <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0 shadow-lg">
              <Award className="h-3 w-3 mr-1" />
              Completado
            </Badge>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
        
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {course.title}
          </h4>
          
            <div className="mt-auto space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {getHumanProgressMessage(course.progress)}
                  </span>
                  <span className={cn(
                    "font-semibold",
                    isComplete ? "text-emerald-500" : "text-primary"
                  )}>
                    {Math.round(course.progress)}%
                  </span>
                </div>
                <Progress 
                  value={course.progress} 
                  className={cn(
                    "h-1.5",
                    isComplete && "[&>div]:bg-emerald-500"
                  )} 
                />
              </div>
            
              <Button 
                size="sm" 
                className={cn(
                  "w-full gap-2",
                  isComplete 
                    ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30"
                    : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(course.id);
                }}
              >
                {isComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Revisar curso
                  </>
                ) : course.progress > 0 ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Continuar aprendiendo
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Comenzar ahora
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  });

CourseCard.displayName = "StudentCourseCard";

export const StudentDashboard = memo(({ userId }: StudentDashboardProps) => {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalProgress: 0,
    certificatesEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load enrolled courses with progress
      const { data: enrollments } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          courses (id, title, image_url, level)
        `)
        .eq('user_id', userId)
        .eq('status', 'enrolled');

      const coursesWithProgress = await Promise.all(
        (enrollments || []).map(async (enrollment: any) => {
          const course = enrollment.courses;
          if (!course) return null;

          // Get total lessons for this course
          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id)
            .eq('is_active', true);

          const moduleIds = (modules || []).map(m => m.id);
          
          if (moduleIds.length === 0) {
            return {
              id: course.id,
              title: course.title,
              image_url: course.image_url,
              level: course.level,
              progress: 0,
              total_lessons: 0,
              completed_lessons: 0,
            };
          }

          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('is_active', true)
            .in('module_id', moduleIds);

          const lessonIds = (lessons || []).map(l => l.id);

          // Get completed lessons
          const { data: completed } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('completed', true)
            .in('lesson_id', lessonIds.length > 0 ? lessonIds : ['']);

          const totalLessons = lessons?.length || 0;
          const completedLessons = completed?.length || 0;
          const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

          return {
            id: course.id,
            title: course.title,
            image_url: course.image_url,
            level: course.level,
            progress,
            total_lessons: totalLessons,
            completed_lessons: completedLessons,
          };
        })
      );

      const validCourses = coursesWithProgress.filter(Boolean) as EnrolledCourse[];
      setEnrolledCourses(validCourses);

      // Calculate stats
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      const completedCoursesCount = validCourses.filter(c => c.progress >= 100).length;

      setStats({
        totalCourses: validCourses.length,
        completedLessons: allProgress?.length || 0,
        totalProgress: validCourses.length > 0 
          ? validCourses.reduce((acc, c) => acc + c.progress, 0) / validCourses.length 
          : 0,
        certificatesEarned: completedCoursesCount,
      });

      // Load recent activity
      const { data: recentData } = await supabase
        .from('user_progress')
        .select(`
          lesson_id,
          completed_at,
          lessons (title, module_id, modules (title))
        `)
        .eq('user_id', userId)
        .eq('completed', true)
        .order('completed_at', { ascending: false })
        .limit(5);

      const activities = (recentData || []).map((item: any) => ({
        lesson_id: item.lesson_id,
        lesson_title: item.lessons?.title || 'Lección',
        module_title: item.lessons?.modules?.title || 'Módulo',
        completed_at: item.completed_at,
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleContinue = useCallback((courseId: string) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  const handleViewCourse = useCallback((courseId: string) => {
    navigate(`/course/${courseId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Learning Analytics */}
      <StudentAnalytics userId={userId} />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          value={stats.totalCourses}
          label="Cursos activos"
          color="bg-primary/10 text-primary"
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.completedLessons}
          label="Lecciones completadas"
          color="bg-emerald-500/10 text-emerald-500"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          value={`${Math.round(stats.totalProgress)}%`}
          label="Progreso promedio"
          color="bg-violet-500/10 text-violet-500"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          value={stats.certificatesEarned}
          label="Certificados"
          color="bg-amber-500/10 text-amber-500"
          delay={0.3}
        />
      </div>

      {/* My Courses */}
      {enrolledCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mis Cursos</h3>
            {enrolledCourses.length > 3 && (
              <Button variant="ghost" onClick={() => navigate('/dashboard/courses')} className="gap-1">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course, idx) => (
              <CourseCard
                key={course.id}
                course={course}
                index={idx}
                onContinue={handleContinue}
                onViewCourse={handleViewCourse}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Courses State */}
      {enrolledCourses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-10 text-center bg-card/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Comienza tu viaje de aprendizaje</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explora nuestro catálogo y encuentra el curso perfecto para ti
            </p>
            <Button 
              onClick={() => navigate('/courses')} 
              className="gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <Sparkles className="h-4 w-4" />
              Explorar cursos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <Card className="divide-y divide-border/50 bg-card/50">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={`${activity.lesson_id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/lesson/${activity.lesson_id}`)}
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.lesson_title}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.module_title}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                  {activity.completed_at && new Date(activity.completed_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </motion.div>
            ))}
          </Card>
        </div>
      )}

      {/* Recommendations */}
      <CourseRecommendations userId={userId} limit={4} />
    </div>
  );
});
