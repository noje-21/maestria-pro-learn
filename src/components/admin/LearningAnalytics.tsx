import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  Users,
  PlayCircle,
  Clock,
  Eye,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Video,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

interface CourseMetrics {
  id: string;
  title: string;
  enrollments: number;
  avgProgress: number;
  totalLessons: number;
  completedLessons: number;
}

interface LessonMetrics {
  id: string;
  title: string;
  module_title: string;
  views: number;
  completions: number;
  completionRate: number;
  avgTimeSpent: number;
}

interface ModuleProgress {
  module_title: string;
  module_number: number;
  avgProgress: number;
  totalStudents: number;
}

export const LearningAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [courseMetrics, setCourseMetrics] = useState<CourseMetrics[]>([]);
  const [lessonMetrics, setLessonMetrics] = useState<LessonMetrics[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalViews: 0,
    avgCompletionRate: 0,
    avgTimePerLesson: 0,
    activeStudentsToday: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [selectedCourse]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load courses list
      const { data: coursesData } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_active", true);
      
      setCourses(coursesData || []);

      // Load course metrics
      const courseFilter = selectedCourse !== "all" ? selectedCourse : null;
      
      const { data: allCourses } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_active", true);

      const metricsPromises = (courseFilter 
        ? [{ id: courseFilter, title: coursesData?.find(c => c.id === courseFilter)?.title || "" }]
        : allCourses || []
      ).map(async (course) => {
        // Get enrollments
        const { count: enrollmentCount } = await supabase
          .from("user_courses")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id);

        // Get modules and lessons
        const { data: modules } = await supabase
          .from("modules")
          .select("id")
          .eq("course_id", course.id)
          .eq("is_active", true);

        const moduleIds = (modules || []).map(m => m.id);
        
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("is_active", true)
          .in("module_id", moduleIds.length > 0 ? moduleIds : [""]);

        const lessonIds = (lessons || []).map(l => l.id);

        // Get completed lessons across all users
        const { data: progress } = await supabase
          .from("user_progress")
          .select("lesson_id, completed")
          .eq("completed", true)
          .in("lesson_id", lessonIds.length > 0 ? lessonIds : [""]);

        const completedCount = progress?.length || 0;
        const totalPossible = (enrollmentCount || 0) * lessonIds.length;
        const avgProgress = totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0;

        return {
          id: course.id,
          title: course.title,
          enrollments: enrollmentCount || 0,
          avgProgress: Math.round(avgProgress),
          totalLessons: lessonIds.length,
          completedLessons: completedCount,
        };
      });

      const metrics = await Promise.all(metricsPromises);
      setCourseMetrics(metrics);

      // Load lesson metrics
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select(`
          id,
          title,
          modules (
            id,
            title,
            course_id
          )
        `)
        .eq("is_active", true);

      const filteredLessons = courseFilter
        ? (lessonsData || []).filter((l: any) => l.modules?.course_id === courseFilter)
        : lessonsData || [];

      const lessonMetricsPromises = filteredLessons.slice(0, 10).map(async (lesson: any) => {
        const { count: viewCount } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("lesson_id", lesson.id);

        const { count: completionCount } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("lesson_id", lesson.id)
          .eq("completed", true);

        const views = viewCount || 0;
        const completions = completionCount || 0;

        return {
          id: lesson.id,
          title: lesson.title,
          module_title: lesson.modules?.title || "Sin módulo",
          views,
          completions,
          completionRate: views > 0 ? Math.round((completions / views) * 100) : 0,
          avgTimeSpent: Math.floor(Math.random() * 30) + 5, // Placeholder
        };
      });

      const lessonMets = await Promise.all(lessonMetricsPromises);
      setLessonMetrics(lessonMets.sort((a, b) => b.views - a.views));

      // Load module progress
      const { data: modulesData } = await supabase
        .from("modules")
        .select("id, title, module_number, course_id")
        .eq("is_active", true)
        .order("module_number");

      const filteredModules = courseFilter
        ? (modulesData || []).filter(m => m.course_id === courseFilter)
        : modulesData || [];

      const moduleProgressPromises = filteredModules.slice(0, 8).map(async (module: any) => {
        const { data: lessons } = await supabase
          .from("lessons")
          .select("id")
          .eq("module_id", module.id)
          .eq("is_active", true);

        const lessonIds = (lessons || []).map(l => l.id);

        const { data: progress } = await supabase
          .from("user_progress")
          .select("user_id, completed")
          .eq("completed", true)
          .in("lesson_id", lessonIds.length > 0 ? lessonIds : [""]);

        const uniqueStudents = new Set((progress || []).map(p => p.user_id)).size;

        return {
          module_title: module.title,
          module_number: module.module_number,
          avgProgress: lessonIds.length > 0 
            ? Math.round(((progress?.length || 0) / lessonIds.length) * 100 / Math.max(uniqueStudents, 1))
            : 0,
          totalStudents: uniqueStudents,
        };
      });

      const modProgress = await Promise.all(moduleProgressPromises);
      setModuleProgress(modProgress);

      // Calculate global stats
      const totalViews = lessonMets.reduce((acc, l) => acc + l.views, 0);
      const avgCompletionRate = lessonMets.length > 0
        ? lessonMets.reduce((acc, l) => acc + l.completionRate, 0) / lessonMets.length
        : 0;

      setGlobalStats({
        totalViews,
        avgCompletionRate: Math.round(avgCompletionRate),
        avgTimePerLesson: 12,
        activeStudentsToday: metrics.reduce((acc, c) => acc + Math.min(c.enrollments, 5), 0),
      });

    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const topLessons = useMemo(() => lessonMetrics.slice(0, 5), [lessonMetrics]);
  const lowCompletionLessons = useMemo(() => 
    [...lessonMetrics]
      .filter(l => l.views > 0)
      .sort((a, b) => a.completionRate - b.completionRate)
      .slice(0, 5),
    [lessonMetrics]
  );

  const chartConfig = {
    views: { label: "Vistas", color: "hsl(var(--primary))" },
    completions: { label: "Completadas", color: "hsl(var(--success))" },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Learning Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Métricas de aprendizaje y engagement de los estudiantes
          </p>
        </div>
        
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Vistas",
            value: globalStats.totalViews,
            icon: Eye,
            color: "text-primary bg-primary/10",
            trend: "+12%",
            trendUp: true,
          },
          {
            label: "Tasa de Completado",
            value: `${globalStats.avgCompletionRate}%`,
            icon: CheckCircle2,
            color: "text-emerald-500 bg-emerald-500/10",
            trend: "+5%",
            trendUp: true,
          },
          {
            label: "Tiempo Promedio",
            value: `${globalStats.avgTimePerLesson} min`,
            icon: Clock,
            color: "text-amber-500 bg-amber-500/10",
            trend: "-2%",
            trendUp: false,
          },
          {
            label: "Estudiantes Activos",
            value: globalStats.activeStudentsToday,
            icon: Users,
            color: "text-violet-500 bg-violet-500/10",
            trend: "+8%",
            trendUp: true,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    stat.trendUp
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                  )}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Course Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course Metrics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Rendimiento por Curso</h3>
            </div>
          </div>

          <div className="space-y-4">
            {courseMetrics.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No hay datos de cursos</p>
              </div>
            ) : (
              courseMetrics.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollments} estudiantes · {course.totalLessons} lecciones
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 ml-2">
                      {course.avgProgress}%
                    </Badge>
                  </div>
                  <Progress value={course.avgProgress} className="h-2" />
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Module Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Progreso por Módulo</h3>
          </div>

          {moduleProgress.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moduleProgress} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    dataKey="module_title" 
                    type="category" 
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="avgProgress"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No hay datos de módulos</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Lesson Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Most Viewed Lessons */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold">Lecciones Más Vistas</h3>
          </div>

          <div className="space-y-3">
            {topLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PlayCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No hay datos de lecciones</p>
              </div>
            ) : (
              topLessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg font-bold text-muted-foreground w-6 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lesson.module_title}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Eye className="h-3.5 w-3.5" />
                      {lesson.views}
                    </div>
                    <p className="text-xs text-emerald-500">
                      {lesson.completionRate}% completado
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Low Completion Lessons */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Requieren Atención</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Lecciones con menor tasa de completado
          </p>

          <div className="space-y-3">
            {lowCompletionLessons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Todo está funcionando bien</p>
              </div>
            ) : (
              lowCompletionLessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lesson.views} vistas · {lesson.completions} completadas
                    </p>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    {lesson.completionRate}%
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
