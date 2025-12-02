import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  PlayCircle,
  ArrowRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { motion } from "framer-motion";

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

export const StudentDashboard = ({ userId }: StudentDashboardProps) => {
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

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
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
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('is_active', true)
            .in('module_id', 
              (await supabase
                .from('modules')
                .select('id')
                .eq('course_id', course.id)
                .eq('is_active', true)
              ).data?.map((m: any) => m.id) || []
            );

          // Get completed lessons
          const { data: completed } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('completed', true)
            .in('lesson_id', lessons?.map((l: any) => l.id) || []);

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
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="p-6 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Cursos activos</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.completedLessons}</p>
                <p className="text-sm text-muted-foreground">Lecciones completadas</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{Math.round(stats.totalProgress)}%</p>
                <p className="text-sm text-muted-foreground">Progreso promedio</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.certificatesEarned}</p>
                <p className="text-sm text-muted-foreground">Certificados</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* My Courses */}
      {enrolledCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mis Cursos</h3>
            {enrolledCourses.length > 3 && (
              <Button variant="ghost" onClick={() => navigate('/dashboard/courses')}>
                Ver todos
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className="overflow-hidden border-border hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-10 w-10 text-primary/50" />
                      </div>
                    )}
                    {course.progress >= 100 && (
                      <Badge className="absolute top-2 right-2 bg-success text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {course.completed_lessons}/{course.total_lessons} lecciones
                        </span>
                        <span className="font-semibold text-primary">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full btn-gradient-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.id}`);
                      }}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continuar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Courses State */}
      {enrolledCourses.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aún no tienes cursos</h3>
          <p className="text-muted-foreground mb-4">
            Explora nuestro catálogo y comienza tu aprendizaje
          </p>
          <Button onClick={() => navigate('/courses')} className="btn-gradient-primary">
            Explorar cursos
          </Button>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <Card className="divide-y divide-border">
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={`${activity.lesson_id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/lesson/${activity.lesson_id}`)}
              >
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.lesson_title}</p>
                  <p className="text-sm text-muted-foreground">{activity.module_title}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
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
};
