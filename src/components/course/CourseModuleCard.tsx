import { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  PlayCircle, 
  User,
  Clock,
  BookOpen
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  duration_minutes: number;
  completed: boolean;
  locked?: boolean;
}

interface CourseModuleCardProps {
  moduleNumber: number;
  title: string;
  description?: string;
  instructor?: string;
  lessons: Lesson[];
  isExpanded?: boolean;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
  defaultExpanded?: boolean;
}

const LessonItem = memo(({
  lesson,
  isCurrent,
  onClick,
}: {
  lesson: Lesson;
  isCurrent: boolean;
  onClick: () => void;
}) => {
  const isLocked = lesson.locked;
  const isCompleted = lesson.completed;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { x: 4, backgroundColor: "hsl(var(--muted) / 0.5)" } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
        isLocked && "opacity-50 cursor-not-allowed",
        isCurrent && "bg-primary/10 ring-1 ring-primary/30"
      )}
    >
      {/* Status Icon */}
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all",
        isCompleted 
          ? "bg-emerald-500/20 text-emerald-500" 
          : isCurrent
            ? "bg-primary text-primary-foreground"
            : isLocked
              ? "bg-muted text-muted-foreground"
              : "bg-muted/50 text-muted-foreground"
      )}>
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : isLocked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : isCurrent ? (
          <PlayCircle className="h-4 w-4" />
        ) : (
          <span className="text-xs font-bold">{lesson.lesson_number}</span>
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm truncate transition-colors",
          isCurrent ? "font-semibold text-foreground" : "text-foreground/80",
          isCompleted && !isCurrent && "text-muted-foreground"
        )}>
          {lesson.title}
        </p>
        {lesson.duration_minutes > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{lesson.duration_minutes} min</span>
          </div>
        )}
      </div>

      {/* Completed badge */}
      {isCompleted && !isCurrent && (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0 text-xs">
          Completada
        </Badge>
      )}
      {isCurrent && (
        <Badge className="bg-primary text-primary-foreground border-0 text-xs">
          Viendo
        </Badge>
      )}
    </motion.button>
  );
});

LessonItem.displayName = "LessonItem";

const CourseModuleCardComponent = ({
  moduleNumber,
  title,
  description,
  instructor,
  lessons,
  currentLessonId,
  onLessonClick,
  defaultExpanded = false,
}: CourseModuleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = lessons.filter(l => l.completed).length;
  const totalCount = lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100;
  const hasCurrentLesson = lessons.some(l => l.id === currentLessonId);
  const isInProgress = completedCount > 0 && completedCount < totalCount;

  const toggle = useCallback(() => setIsExpanded(prev => !prev), []);

  // Get module status
  const getStatusConfig = () => {
    if (isComplete) {
      return { 
        label: "Completado", 
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        iconBg: "bg-emerald-500/20 text-emerald-500"
      };
    }
    if (hasCurrentLesson) {
      return { 
        label: "En curso", 
        color: "bg-primary/10 text-primary border-primary/30",
        iconBg: "bg-primary text-primary-foreground"
      };
    }
    if (isInProgress) {
      return { 
        label: "En progreso", 
        color: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        iconBg: "bg-amber-500/20 text-amber-500"
      };
    }
    return { 
      label: "Disponible", 
      color: "bg-muted/50 text-muted-foreground border-border/50",
      iconBg: "bg-primary/10 text-primary"
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={cn(
      "overflow-hidden transition-all border-border/50",
      hasCurrentLesson && "ring-1 ring-primary/30 border-primary/30",
      isComplete && "border-emerald-500/30"
    )}>
      {/* Module Header */}
      <motion.button
        onClick={toggle}
        className="w-full p-4 md:p-5 flex items-start gap-4 text-left hover:bg-muted/30 transition-colors"
        whileTap={{ scale: 0.995 }}
      >
        {/* Module Number */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold shrink-0",
          statusConfig.iconBg
        )}>
          {isComplete ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            moduleNumber
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base md:text-lg truncate">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <Badge className={cn("shrink-0 border", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {instructor && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{instructor}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{totalCount} lecciones</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{completedCount}/{totalCount}</span>
              <span>completadas</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <Progress 
              value={percentage} 
              className={cn(
                "h-2 flex-1",
                isComplete && "[&>div]:bg-emerald-500"
              )} 
            />
            <span className={cn(
              "text-xs font-medium min-w-[2.5rem] text-right",
              isComplete ? "text-emerald-500" : "text-primary"
            )}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Lessons List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 md:px-5 md:pb-5 pt-0 space-y-1 border-t border-border/30">
              <div className="pt-3">
                {lessons.map((lesson) => (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isCurrent={lesson.id === currentLessonId}
                    onClick={() => !lesson.locked && onLessonClick(lesson.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export const CourseModuleCard = memo(CourseModuleCardComponent);
