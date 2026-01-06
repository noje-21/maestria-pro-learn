import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  BarChart3,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminLearningInsights } from "@/hooks/useLearningAnalytics";

const formatHours = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(1)}h`;
};

const getCompletionLabel = (rate: number): { label: string; color: string } => {
  if (rate >= 80) return { label: "Excelente", color: "text-emerald-500" };
  if (rate >= 60) return { label: "Bueno", color: "text-primary" };
  if (rate >= 40) return { label: "Moderado", color: "text-amber-500" };
  return { label: "Bajo", color: "text-red-500" };
};

export const AdminLearningInsights = memo(() => {
  const { insights, loading } = useAdminLearningInsights();

  const completionInfo = useMemo(() => {
    if (!insights) return null;
    return getCompletionLabel(insights.avgCompletionRate);
  }, [insights]);

  const activePercentage = useMemo(() => {
    if (!insights || insights.totalStudents === 0) return 0;
    return Math.round((insights.activeStudentsWeek / insights.totalStudents) * 100);
  }, [insights]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Sin datos de analytics</h3>
        <p className="text-sm text-muted-foreground">
          Los insights aparecerán cuando los estudiantes comiencen a usar la plataforma
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                {activePercentage}% activos
              </Badge>
            </div>
            <p className="text-3xl font-bold">{insights.totalStudents}</p>
            <p className="text-sm text-muted-foreground">Estudiantes totales</p>
          </Card>
        </motion.div>

        {/* Active This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-3xl font-bold">{insights.activeStudentsWeek}</p>
            <p className="text-sm text-muted-foreground">Activos esta semana</p>
          </Card>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <Target className="h-5 w-5 text-violet-500" />
              </div>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", completionInfo?.color)}
              >
                {completionInfo?.label}
              </Badge>
            </div>
            <p className="text-3xl font-bold">{insights.avgCompletionRate}%</p>
            <p className="text-sm text-muted-foreground">Tasa de completado</p>
          </Card>
        </motion.div>

        {/* Stagnant Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className={cn(
            "p-4 h-full",
            insights.stagnantUsers > 0 && "border-amber-500/30"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                insights.stagnantUsers > 0 
                  ? "bg-amber-500/10" 
                  : "bg-muted"
              )}>
                <UserX className={cn(
                  "h-5 w-5",
                  insights.stagnantUsers > 0 
                    ? "text-amber-500" 
                    : "text-muted-foreground"
                )} />
              </div>
              {insights.stagnantUsers > 0 && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <p className="text-3xl font-bold">{insights.stagnantUsers}</p>
            <p className="text-sm text-muted-foreground">Inactivos (+7 días)</p>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Rendimiento por Curso</h3>
          </div>

          {insights.coursesWithData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No hay datos de cursos aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.coursesWithData.map((course, idx) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{course.enrolled} inscritos</span>
                        <span className="text-emerald-500">
                          {course.completed} completados
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "shrink-0 ml-2",
                        course.avg_progress >= 80 && "border-emerald-500/30 text-emerald-500",
                        course.avg_progress >= 50 && course.avg_progress < 80 && "border-primary/30 text-primary",
                        course.avg_progress < 50 && "border-amber-500/30 text-amber-500"
                      )}
                    >
                      {course.avg_progress}%
                    </Badge>
                  </div>
                  <Progress 
                    value={course.avg_progress} 
                    className={cn(
                      "h-2",
                      course.avg_progress >= 80 && "[&>div]:bg-emerald-500",
                      course.avg_progress < 50 && "[&>div]:bg-amber-500"
                    )} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Difficult Modules */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Módulos que Requieren Más Tiempo</h3>
          </div>

          {insights.difficultModules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Sin datos de tiempo por módulo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.difficultModules.map((module, idx) => (
                <motion.div
                  key={module.module_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                    idx === 0 && "bg-amber-500/10 text-amber-500",
                    idx === 1 && "bg-orange-500/10 text-orange-500",
                    idx >= 2 && "bg-muted text-muted-foreground"
                  )}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{module.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {module.course_title}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    ~{module.avg_time_minutes} min
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}

          {insights.difficultModules.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
              💡 Estos módulos podrían necesitar contenido adicional de apoyo
            </p>
          )}
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Resumen de Insights</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Tiempo promedio por curso</p>
                <p className="font-semibold text-lg">
                  {formatHours(insights.avgTimePerCourseHours)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tasa de finalización</p>
                <p className={cn("font-semibold text-lg", completionInfo?.color)}>
                  {insights.avgCompletionRate}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Usuarios en riesgo</p>
                <p className={cn(
                  "font-semibold text-lg",
                  insights.stagnantUsers > 0 ? "text-amber-500" : "text-emerald-500"
                )}>
                  {insights.stagnantUsers} de {insights.totalStudents}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

AdminLearningInsights.displayName = "AdminLearningInsights";
