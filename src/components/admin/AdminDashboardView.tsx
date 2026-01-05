import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Plus,
  ArrowUpRight,
  BarChart3,
  Clock,
  CheckCircle,
  UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeUsers: number;
  pendingUsers: number;
  approvedUsers: number;
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

interface AdminDashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView = ({ onNavigate }: AdminDashboardViewProps) => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [topCourses, setTopCourses] = useState<CourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Parallel requests for better performance
      const [
        usersResult,
        coursesResult,
        enrollmentsResult,
        profilesResult,
        recentEnrollmentsResult,
        coursesDataResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_courses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('status'),
        supabase.from('user_courses')
          .select(`enrolled_at, profiles (full_name), courses (title)`)
          .order('enrolled_at', { ascending: false })
          .limit(5),
        supabase.from('courses').select('id, title').eq('is_active', true)
      ]);

      // Get active users
      const { data: activeUsersData } = await supabase
        .from('user_courses')
        .select('user_id')
        .eq('status', 'enrolled');
      
      const uniqueActiveUsers = new Set(activeUsersData?.map(u => u.user_id)).size;

      // Count by status
      const statusCounts = (profilesResult.data || []).reduce((acc, p) => {
        acc[p.status || 'pending'] = (acc[p.status || 'pending'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        activeUsers: uniqueActiveUsers,
        pendingUsers: statusCounts['pending'] || 0,
        approvedUsers: statusCounts['approved'] || 0,
      });

      // Process recent enrollments
      const recentData = (recentEnrollmentsResult.data || []).map((e: any) => ({
        user_name: e.profiles?.full_name || 'Usuario',
        course_title: e.courses?.title || 'Curso',
        enrolled_at: e.enrolled_at,
      }));
      setRecentEnrollments(recentData);

      // Get top courses by enrollments
      const coursesWithStats = await Promise.all(
        (coursesDataResult.data || []).slice(0, 5).map(async (course) => {
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
      setTopCourses(coursesWithStats);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = useMemo(() => [
    {
      label: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: null,
    },
    {
      label: "Cursos Activos",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "text-success",
      bgColor: "bg-success/10",
      trend: null,
    },
    {
      label: "Inscripciones",
      value: stats.totalEnrollments,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: null,
    },
    {
      label: "Estudiantes Activos",
      value: stats.activeUsers,
      icon: Award,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      trend: null,
    },
  ], [stats]);

  const quickActions = [
    { label: "Crear Curso", icon: Plus, tab: "courses" },
    { label: "Gestionar Usuarios", icon: Users, tab: "users" },
    { label: "Ver Progreso", icon: BarChart3, tab: "progress" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Skeleton Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">Gestiona usuarios, cursos y contenido</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.tab}
              variant="outline"
              size="sm"
              onClick={() => onNavigate(action.tab)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 lg:p-6 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl lg:text-3xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs lg:text-sm text-muted-foreground truncate">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            className="p-4 border-yellow-500/20 hover:border-yellow-500/40 transition-colors cursor-pointer"
            onClick={() => onNavigate('users')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-500">{stats.pendingUsers}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card 
            className="p-4 border-success/20 hover:border-success/40 transition-colors cursor-pointer"
            onClick={() => onNavigate('users')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold text-success">{stats.approvedUsers}</p>
                  <p className="text-xs text-muted-foreground">Aprobados</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-2 lg:col-span-1"
        >
          <Card 
            className="p-4 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
            onClick={() => onNavigate('users')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Registrados</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Courses */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Cursos Populares</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('courses')}>
              Ver todos
            </Button>
          </div>

          <div className="space-y-3">
            {topCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay cursos aún</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => onNavigate('courses')}
                  className="mt-2"
                >
                  Crear primer curso
                </Button>
              </div>
            ) : (
              topCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg font-bold text-muted-foreground w-6 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments} inscripciones
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {Math.round(course.avg_progress)}%
                  </Badge>
                </motion.div>
              ))
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
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay inscripciones recientes</p>
              </div>
            ) : (
              recentEnrollments.map((enrollment, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{enrollment.user_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {enrollment.course_title}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {enrollment.enrolled_at && new Date(enrollment.enrolled_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
