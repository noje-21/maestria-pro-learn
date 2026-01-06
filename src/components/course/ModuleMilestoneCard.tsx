import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  BookOpen,
  ChevronRight,
  Target,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getModuleProgressMessage } from "@/utils/progressMessages";

export interface ModuleMilestoneLesson {
  id: string;
  lesson_number: number;
  title: string;
  duration_minutes: number;
  completed: boolean;
  locked?: boolean;
}

export interface ModuleMilestoneCardProps {
  moduleNumber: number;
  title: string;
  description?: string;
  instructor?: string;
  lessons: ModuleMilestoneLesson[];
  isLocked?: boolean;
  onStartModule: (firstLessonId: string) => void;
  onContinueModule: (lessonId: string) => void;
  onReviewModule: (firstLessonId: string) => void;
}

type ModuleStatus = "locked" | "available" | "in_progress" | "completed";

const ModuleMilestoneCardComponent = ({
  moduleNumber,
  title,
  description,
  instructor,
  lessons,
  isLocked = false,
  onStartModule,
  onContinueModule,
  onReviewModule,
}: ModuleMilestoneCardProps) => {
  const completedCount = lessons.filter((l) => l.completed).length;
  const totalCount = lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

  // Determine module status
  const getStatus = (): ModuleStatus => {
    if (isLocked) return "locked";
    if (percentage === 100) return "completed";
    if (completedCount > 0) return "in_progress";
    return "available";
  };

  const status = getStatus();

  // Find the next incomplete lesson or first lesson
  const getNextLessonId = useCallback((): string | null => {
    const incompletelesson = lessons.find((l) => !l.completed && !l.locked);
    if (incompletelesson) return incompletelesson.id;
    return lessons[0]?.id || null;
  }, [lessons]);

  // Handle CTA click
  const handleCTAClick = useCallback(() => {
    const nextId = getNextLessonId();
    if (!nextId) return;

    if (status === "completed") {
      onReviewModule(lessons[0].id);
    } else if (status === "in_progress") {
      onContinueModule(nextId);
    } else if (status === "available") {
      onStartModule(lessons[0].id);
    }
  }, [status, lessons, getNextLessonId, onStartModule, onContinueModule, onReviewModule]);

  // Status configuration
  const statusConfig = {
    locked: {
      label: "Bloqueado",
      color: "bg-muted/50 text-muted-foreground border-border/50",
      iconBg: "bg-muted text-muted-foreground",
      icon: Lock,
      cta: null,
      ctaVariant: "secondary" as const,
    },
    available: {
      label: "Disponible",
      color: "bg-primary/10 text-primary border-primary/30",
      iconBg: "bg-primary/15 text-primary",
      icon: Target,
      cta: "Empezar módulo",
      ctaVariant: "default" as const,
    },
    in_progress: {
      label: "En progreso",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      iconBg: "bg-amber-500/15 text-amber-600",
      icon: Play,
      cta: "Continuar módulo",
      ctaVariant: "default" as const,
    },
    completed: {
      label: "Completado",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      iconBg: "bg-emerald-500/15 text-emerald-600",
      icon: CheckCircle2,
      cta: "Revisar módulo",
      ctaVariant: "outline" as const,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "border-border/50 hover:border-border",
          status === "locked" && "opacity-60",
          status === "in_progress" && "ring-1 ring-amber-500/30 border-amber-500/30",
          status === "completed" && "border-emerald-500/30"
        )}
      >
        {/* Premium gradient overlay for completed modules */}
        {status === "completed" && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        )}

        <div className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* Module Number Badge */}
            <motion.div
              whileHover={status !== "locked" ? { scale: 1.05 } : undefined}
              className={cn(
                "flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl text-xl md:text-2xl font-bold shrink-0 transition-all",
                config.iconBg
              )}
            >
              {status === "completed" ? (
                <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8" />
              ) : status === "locked" ? (
                <Lock className="h-6 w-6 md:h-7 md:w-7" />
              ) : (
                moduleNumber
              )}
            </motion.div>

            {/* Module Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground leading-tight">
                    Hito {moduleNumber}: {title}
                  </h3>
                  {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
                <Badge className={cn("shrink-0 border", config.color)}>
                  {status === "in_progress" && <Sparkles className="h-3 w-3 mr-1" />}
                  {config.label}
                </Badge>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalCount} {totalCount === 1 ? "paso" : "pasos"}</span>
                </div>
                {totalDuration > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>~{totalDuration} min</span>
                  </div>
                )}
                {instructor && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground/70">{instructor}</span>
                  </div>
                )}
              </div>

              {/* Progress Section */}
              {status !== "locked" && status !== "available" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Progress
                      value={percentage}
                      className={cn(
                        "h-2.5 flex-1",
                        status === "completed" && "[&>div]:bg-emerald-500",
                        status === "in_progress" && "[&>div]:bg-amber-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-semibold min-w-[3rem] text-right tabular-nums",
                        status === "completed" ? "text-emerald-600" : "text-amber-600"
                      )}
                    >
                      {percentage}%
                    </span>
                  </div>
                  {/* Human-friendly progress message */}
                  <p className="text-xs text-muted-foreground">
                    {getModuleProgressMessage(completedCount, totalCount)}
                  </p>
                </div>
              )}

              {/* Locked Message */}
              {status === "locked" && (
                <p className="text-sm text-muted-foreground/80 italic flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  Completa el módulo anterior para desbloquear este
                </p>
              )}
            </div>

            {/* CTA Button */}
            <div className="md:self-center shrink-0 pt-2 md:pt-0">
              {config.cta && (
                <Button
                  onClick={handleCTAClick}
                  variant={config.ctaVariant}
                  disabled={status === "locked"}
                  className={cn(
                    "w-full md:w-auto gap-2 min-w-[160px]",
                    status === "available" &&
                      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20",
                    status === "in_progress" &&
                      "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20"
                  )}
                >
                  {status === "available" && <Play className="h-4 w-4" />}
                  {status === "in_progress" && <Play className="h-4 w-4" />}
                  {status === "completed" && <CheckCircle2 className="h-4 w-4" />}
                  {config.cta}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const ModuleMilestoneCard = memo(ModuleMilestoneCardComponent);
