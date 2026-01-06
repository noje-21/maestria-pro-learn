import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModuleMilestoneCard, ModuleMilestoneLesson } from "./ModuleMilestoneCard";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons: ModuleMilestoneLesson[];
}

interface CourseRoadmapProps {
  courseTitle: string;
  courseDescription?: string;
  modules: Module[];
  stats: {
    totalModules: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  enableProgressiveLocking?: boolean;
}

const CourseRoadmapComponent = ({
  courseTitle,
  courseDescription,
  modules,
  stats,
  enableProgressiveLocking = false,
}: CourseRoadmapProps) => {
  const navigate = useNavigate();

  // Calculate which modules should be locked based on progressive locking
  const modulesWithLockStatus = useMemo(() => {
    if (!enableProgressiveLocking) {
      return modules.map((m) => ({ ...m, isLocked: false }));
    }

    let previousCompleted = true;
    return modules.map((module) => {
      const isCompleted = module.lessons.every((l) => l.completed);
      const isLocked = !previousCompleted;
      previousCompleted = isCompleted;
      return { ...module, isLocked };
    });
  }, [modules, enableProgressiveLocking]);

  const handleStartModule = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleContinueModule = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  const handleReviewModule = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  // Determine journey status
  const getJourneyStatus = () => {
    if (stats.progress >= 100) return "completed";
    if (stats.progress > 0) return "in_progress";
    return "not_started";
  };

  const journeyStatus = getJourneyStatus();

  return (
    <div className="space-y-8">
      {/* Course Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border/50 p-6 md:p-8"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Icon */}
          <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary shrink-0">
            {journeyStatus === "completed" ? (
              <Trophy className="h-10 w-10" />
            ) : journeyStatus === "in_progress" ? (
              <Sparkles className="h-10 w-10" />
            ) : (
              <GraduationCap className="h-10 w-10" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1">
                <Target className="h-3 w-3" />
                Tu ruta de aprendizaje
              </Badge>
              {journeyStatus === "completed" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                  <Trophy className="h-3 w-3" />
                  ¡Completado!
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {courseTitle}
            </h1>

            {courseDescription && (
              <p className="text-muted-foreground line-clamp-2 max-w-2xl">
                {courseDescription}
              </p>
            )}

            {/* Progress Summary */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <Progress
                  value={stats.progress}
                  className={cn(
                    "h-3 flex-1",
                    stats.progress >= 100 && "[&>div]:bg-emerald-500"
                  )}
                />
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    stats.progress >= 100 ? "text-emerald-500" : "text-primary"
                  )}
                >
                  {Math.round(stats.progress)}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{stats.completedLessons}</span>
                {" de "}
                <span className="font-medium text-foreground">{stats.totalLessons}</span>
                {" pasos completados"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Roadmap Title */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
          {stats.totalModules} Hitos en tu camino
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Module Milestones */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="space-y-4"
      >
        {modulesWithLockStatus.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Sin contenido disponible</h3>
            <p className="text-sm text-muted-foreground">
              Este curso aún no tiene hitos definidos
            </p>
          </div>
        ) : (
          modulesWithLockStatus.map((module, idx) => (
            <motion.div
              key={module.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ModuleMilestoneCard
                moduleNumber={module.module_number}
                title={module.title}
                description={module.description}
                instructor={module.instructor}
                lessons={module.lessons}
                isLocked={module.isLocked}
                onStartModule={handleStartModule}
                onContinueModule={handleContinueModule}
                onReviewModule={handleReviewModule}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Journey End */}
      {journeyStatus === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-600 mb-2">
            ¡Felicitaciones! Has completado el curso
          </h3>
          <p className="text-muted-foreground">
            Has dominado todos los hitos de esta ruta de aprendizaje
          </p>
        </motion.div>
      )}
    </div>
  );
};

export const CourseRoadmap = memo(CourseRoadmapComponent);
