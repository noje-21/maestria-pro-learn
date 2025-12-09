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
      whileHover={{ x: lesson.locked ? 0 : 4, scale: lesson.locked ? 1 : 1.01 }}
      whileTap={{ scale: lesson.locked ? 1 : 0.98 }}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all text-sm group",
        isCurrent
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          : lesson.completed
            ? "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20"
            : "hover:bg-muted/60 border border-transparent hover:border-border/50",
        lesson.locked && "opacity-50 cursor-not-allowed"
      )}
    >
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
          <CheckCircle2 className="h-4 w-4" />
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

      {/* Completion indicator for non-current completed lessons */}
      {lesson.completed && !isCurrent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="shrink-0"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </motion.div>
      )}
    </motion.button>
  );
};

export const LessonItem = memo(LessonItemComponent);
