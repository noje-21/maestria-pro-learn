import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Plus,
  Eye,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
}

interface RecentEnrollment {
  user_name: string;
  course_title: string;
  enrolled_at: string;
}

interface CourseStats {
  id: string;
  title: string;
  enrollments: number;
  avg_progress: number;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [topCourses, setTopCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total courses
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total enrollments
      const { count: enrollmentsCount } = await supabase
        .from('user_courses')
        .select('*', { count: 'exact', head: true });

      // Get active users (with enrollments)
      const { data: activeUsersData } = await supabase
        .from('user_courses')
        .select('user_id')
        .eq('status', 'enrolled');
      
      const uniqueActiveUsers = new Set(activeUsersData?.map(u => u.user_id)).size;

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        totalEnrollments: enrollmentsCount || 0,
        activeUsers: uniqueActiveUsers,
      });

      // Get recent enrollments
      const { data: enrollments } = await supabase
        .from('user_courses')
        .select(`
          enrolled_at,
          profiles (full_name),
          courses (title)
        `)
        .order('enrolled_at', { ascending: false })
        .limit(5);

      const recentData = (enrollments || []).map((e: any) => ({
        user_name: e.profiles?.full_name || 'Usuario',
        course_title: e.courses?.title || 'Curso',
        enrolled_at: e.enrolled_at,
      }));

      setRecentEnrollments(recentData);

      // Get top courses by enrollments
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_active', true);

      const coursesWithStats = await Promise.all(
        (courses || []).map(async (course) => {
          const { count } = await supabase
            .from('user_courses')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          const { data: progressData } = await supabase
            .from('user_courses')
            .select('progress')
            .eq('course_id', course.id);

          const avgProgress = progressData && progressData.length > 0
            ? progressData.reduce((acc, p) => acc + (p.progress || 0), 0) / progressData.length
            : 0;

          return {
            id: course.id,
            title: course.title,
            enrollments: count || 0,
            avg_progress: avgProgress,
          };
        })
      );

      coursesWithStats.sort((a, b) => b.enrollments - a.enrollments);
      setTopCourses(coursesWithStats.slice(0, 5));
    } catch (error) {
      console.error('Error loading admin data:', error);
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
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate('/admin')} className="btn-gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Crear Curso
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          <Users className="h-4 w-4 mr-2" />
          Gestionar Usuarios
        </Button>
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Catálogo
        </Button>
      </div>

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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Usuarios totales</p>
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
                <BookOpen className="h-6 w-6 text-success" />
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
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                <p className="text-sm text-muted-foreground">Inscripciones</p>
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
                <p className="text-3xl font-bold">{stats.activeUsers}</p>
                <p className="text-sm text-muted-foreground">Estudiantes activos</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cursos Populares</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              Ver todos
            </Button>
          </div>

          <div className="space-y-3">
            {topCourses.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.enrollments} inscripciones
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {Math.round(course.avg_progress)}% avg
                </Badge>
              </motion.div>
            ))}

            {topCourses.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay cursos aún
              </p>
            )}
          </div>
        </Card>

        {/* Recent Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Inscripciones Recientes</h3>
            </div>
          </div>

          <div className="space-y-3">
            {recentEnrollments.map((enrollment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{enrollment.user_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {enrollment.course_title}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {enrollment.enrolled_at && new Date(enrollment.enrolled_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </motion.div>
            ))}

            {recentEnrollments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No hay inscripciones recientes
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
