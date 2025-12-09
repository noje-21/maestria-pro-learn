import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonItem } from "./LessonItem";

export interface LessonData {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  completed: boolean;
  type: 'video' | 'pdf' | 'quiz' | 'audio';
  locked?: boolean;
}

export interface ModuleData {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons: LessonData[];
}

interface ModuleAccordionProps {
  module: ModuleData;
  isExpanded: boolean;
  hasCurrentLesson: boolean;
  currentLessonId: string;
  onToggle: () => void;
  onLessonSelect: (lessonId: string) => void;
}

const ModuleAccordionComponent = ({
  module,
  isExpanded,
  hasCurrentLesson,
  currentLessonId,
  onToggle,
  onLessonSelect,
}: ModuleAccordionProps) => {
  const completedCount = module.lessons.filter(l => l.completed).length;
  const totalCount = module.lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <div className="mb-2">
      {/* Module Header */}
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: "rgba(var(--muted), 0.5)" }}
        className={cn(
          "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all",
          hasCurrentLesson && "bg-primary/10 border border-primary/30 shadow-sm"
        )}
      >
        {/* Module Number / Complete Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 transition-colors",
            isComplete
              ? "bg-green-500/20 text-green-500"
              : hasCurrentLesson
                ? "bg-primary text-primary-foreground"
                : "bg-primary/20 text-primary"
          )}
        >
          {isComplete ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : (
            module.module_number
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{module.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} lecciones
            </span>
            {/* Progress bar mini */}
            <div className="flex-1 h-1 bg-muted/50 rounded-full overflow-hidden max-w-[60px]">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isComplete ? "bg-green-500" : "bg-primary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Expand Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Lessons List with Animation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.25, ease: "easeOut" },
                opacity: { duration: 0.2, delay: 0.05 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeIn" },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            <div className="pl-4 pr-2 py-2 space-y-1">
              {module.lessons.map((lesson, index) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isCurrent={lesson.id === currentLessonId}
                  onSelect={() => !lesson.locked && onLessonSelect(lesson.id)}
                  animationDelay={index * 0.03}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ModuleAccordion = memo(ModuleAccordionComponent);
