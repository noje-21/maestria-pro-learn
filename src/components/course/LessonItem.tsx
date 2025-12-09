import { memo } from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  FileText, 
  HelpCircle, 
  Headphones, 
  CheckCircle2, 
  Lock 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonItemProps {
  lesson: {
    id: string;
    lesson_number: number;
    title: string;
    duration_minutes: number;
    completed: boolean;
    type: 'video' | 'pdf' | 'quiz' | 'audio';
    locked?: boolean;
  };
  isCurrent: boolean;
  onSelect: () => void;
  animationDelay?: number;
}

const typeIcons = {
  video: Play,
  pdf: FileText,
  quiz: HelpCircle,
  audio: Headphones,
};

const typeLabels = {
  video: "Video",
  pdf: "Documento",
  quiz: "Examen",
  audio: "Audio",
};

const LessonItemComponent = ({
  lesson,
  isCurrent,
  onSelect,
  animationDelay = 0,
}: LessonItemProps) => {
  const Icon = typeIcons[lesson.type] || Play;

  return (
    <motion.button
      onClick={onSelect}
      disabled={lesson.locked}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, duration: 0.15 }}
      whileHover={!lesson.locked ? { 
        x: 4, 
        scale: 1.01,
        transition: { duration: 0.15 }
      } : undefined}
      whileTap={!lesson.locked ? { scale: 0.98 } : undefined}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm group relative",
        isCurrent
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          : lesson.completed
            ? "bg-green-500/10 hover:bg-green-500/15 border border-green-500/20"
            : "hover:bg-muted/60 border border-transparent hover:border-border/50",
        lesson.locked && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Active indicator line */}
      {isCurrent && (
        <motion.div
          layoutId="activeLesson"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Icon Circle */}
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-all",
          isCurrent
            ? "bg-primary-foreground/20"
            : lesson.completed
              ? "bg-green-500/20 text-green-500"
              : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        {lesson.locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : lesson.completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </motion.div>
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium truncate transition-colors",
            lesson.completed && !isCurrent && "text-muted-foreground"
          )}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 text-xs opacity-70 mt-0.5">
          <span>{typeLabels[lesson.type]}</span>
          {lesson.duration_minutes > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-current opacity-50" />
              <span>{lesson.duration_minutes} min</span>
            </>
          )}
        </div>
      </div>

      {/* Completion pulse animation */}
      {lesson.completed && !isCurrent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="shrink-0"
        >
          <div className="relative">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500/30"
              initial={{ scale: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: 0 }}
            />
          </div>
        </motion.div>
      )}
    </motion.button>
  );
};

export const LessonItem = memo(LessonItemComponent);
