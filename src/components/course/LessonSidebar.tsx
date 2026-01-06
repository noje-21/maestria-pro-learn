import { useState, useMemo, memo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, Search, Target, Lock, PlayCircle, Footprints } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface LessonSidebarProps {
  modules: ModuleData[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  showSearch?: boolean;
  compact?: boolean;
}

// Step/Lesson Item Component
const LessonItemComponent = memo(({
  lesson,
  stepNumber,
  isCurrent,
  onSelect,
}: {
  lesson: LessonData;
  stepNumber: number;
  isCurrent: boolean;
  onSelect: () => void;
}) => {
  const isLocked = lesson.locked;
  const isCompleted = lesson.completed;

  // Human-friendly step labels
  const getStepLabel = () => {
    if (isCurrent) return "Estás aquí";
    if (isCompleted) return "Completado";
    if (isLocked) return "Bloqueado";
    return `Paso ${stepNumber}`;
  };

  return (
    <motion.button
      onClick={onSelect}
      disabled={isLocked}
      whileHover={!isLocked ? { x: 4 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all relative",
        isLocked 
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer hover:bg-muted/50",
        isCurrent && "bg-primary/10 border border-primary/30"
      )}
    >
      {/* Status Icon */}
      <div className={cn(
        "flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-all",
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
          <Lock className="h-3 w-3" />
        ) : isCurrent ? (
          <PlayCircle className="h-4 w-4" />
        ) : (
          <span className="text-xs font-bold">{stepNumber}</span>
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
        <p className="text-xs text-muted-foreground">
          {lesson.duration_minutes > 0 ? `~${lesson.duration_minutes} min` : getStepLabel()}
        </p>
      </div>

      {/* Current indicator */}
      {isCurrent && (
        <motion.div
          layoutId="currentLesson"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
    </motion.button>
  );
});

LessonItemComponent.displayName = "LessonItem";

// Milestone/Module Accordion Component
const ModuleAccordionItem = memo(({
  module,
  isExpanded,
  hasCurrentLesson,
  currentLessonId,
  onToggle,
  onLessonSelect,
}: {
  module: ModuleData;
  isExpanded: boolean;
  hasCurrentLesson: boolean;
  currentLessonId: string;
  onToggle: () => void;
  onLessonSelect: (id: string) => void;
}) => {
  const completedCount = module.lessons.filter(l => l.completed).length;
  const totalCount = module.lessons.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = percentage === 100;

  // Human-friendly milestone status
  const getMilestoneStatus = () => {
    if (isComplete) return "¡Completado!";
    if (hasCurrentLesson) return "En este hito";
    if (completedCount > 0) return "En progreso";
    return "Por comenzar";
  };

  return (
    <div className="mb-2">
      {/* Module Header */}
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
        whileTap={{ scale: 0.995 }}
        className={cn(
          "w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all",
          hasCurrentLesson && "bg-primary/5 border border-primary/20"
        )}
      >
        {/* Module Number / Complete Icon */}
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0 transition-all",
            isComplete
              ? "bg-emerald-500/20 text-emerald-500"
              : hasCurrentLesson
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
          )}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Target className="h-5 w-5" />
          )}
        </div>

        {/* Module Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">
              Hito {module.module_number}
            </h3>
            {hasCurrentLesson && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary">
                Actual
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {module.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalCount} pasos
            </span>
            {/* Progress bar mini */}
            <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden max-w-[60px]">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isComplete ? "bg-emerald-500" : "bg-primary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
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
                height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.05 }
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
            <div className="pl-4 pr-2 py-2 space-y-1">
              {module.lessons.map((lesson, idx) => (
                <LessonItemComponent
                  key={lesson.id}
                  lesson={lesson}
                  stepNumber={idx + 1}
                  isCurrent={lesson.id === currentLessonId}
                  onSelect={() => !lesson.locked && onLessonSelect(lesson.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ModuleAccordionItem.displayName = "ModuleAccordionItem";

// Main Sidebar Component
const LessonSidebarComponent = ({
  modules,
  currentLessonId,
  onLessonSelect,
  showSearch = true,
  compact = false,
}: LessonSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());

  // Auto-expand module containing current lesson
  useEffect(() => {
    const moduleWithCurrentLesson = modules.find(m => 
      m.lessons.some(l => l.id === currentLessonId)
    );
    if (moduleWithCurrentLesson) {
      setExpandedModules(prev => new Set([...prev, moduleWithCurrentLesson.id]));
    }
  }, [currentLessonId, modules]);

  // Filter modules and lessons based on search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;

    const query = searchQuery.toLowerCase();
    return modules
      .map(module => ({
        ...module,
        lessons: module.lessons.filter(lesson =>
          lesson.title.toLowerCase().includes(query)
        ),
      }))
      .filter(module => module.lessons.length > 0);
  }, [modules, searchQuery]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  // Check if a module contains the current lesson
  const hasCurrentLesson = useCallback((module: ModuleData) =>
    module.lessons.some(l => l.id === currentLessonId), [currentLessonId]);

  // Calculate total stats
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.completed).length,
    0
  );
  const completionPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-card/30">
      {/* Search Header */}
      {showSearch && (
        <div className="p-4 border-b border-border/50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5" />
              {completedLessons} de {totalLessons} pasos
            </p>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                completionPercent >= 100 
                  ? "bg-emerald-500/10 text-emerald-600" 
                  : "bg-primary/10 text-primary"
              )}
            >
              {completionPercent}%
            </Badge>
          </div>
        </div>
      )}

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className={cn("p-3", compact && "p-2")}>
          {filteredModules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron pasos</p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <ModuleAccordionItem
                key={module.id}
                module={module}
                isExpanded={expandedModules.has(module.id)}
                hasCurrentLesson={hasCurrentLesson(module)}
                currentLessonId={currentLessonId}
                onToggle={() => toggleModule(module.id)}
                onLessonSelect={onLessonSelect}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const LessonSidebar = memo(LessonSidebarComponent);
