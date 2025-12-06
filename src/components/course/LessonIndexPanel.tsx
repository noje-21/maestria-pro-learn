import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  Search, 
  CheckCircle2, 
  Play, 
  FileText, 
  HelpCircle,
  Headphones,
  Lock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  completed: boolean;
  type: 'video' | 'pdf' | 'quiz' | 'audio';
  locked?: boolean;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons: Lesson[];
}

interface LessonIndexPanelProps {
  modules: Module[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
}

const lessonTypeIcons = {
  video: Play,
  pdf: FileText,
  quiz: HelpCircle,
  audio: Headphones,
};

const lessonTypeLabels = {
  video: "Video",
  pdf: "Documento",
  quiz: "Examen",
  audio: "Audio",
};

export const LessonIndexPanel = ({
  modules,
  currentLessonId,
  onLessonSelect,
}: LessonIndexPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.map(m => m.id))
  );

  // Find current module and expand it
  const currentModule = useMemo(() => {
    for (const module of modules) {
      if (module.lessons.some(l => l.id === currentLessonId)) {
        return module.id;
      }
    }
    return null;
  }, [modules, currentLessonId]);

  // Filter lessons based on search
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    
    const query = searchQuery.toLowerCase();
    return modules.map(module => ({
      ...module,
      lessons: module.lessons.filter(
        lesson => lesson.title.toLowerCase().includes(query)
      ),
    })).filter(module => module.lessons.length > 0);
  }, [modules, searchQuery]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => l.completed).length;
    return {
      completed,
      total: module.lessons.length,
      percentage: module.lessons.length > 0 
        ? Math.round((completed / module.lessons.length) * 100) 
        : 0,
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      {/* Modules List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredModules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const progress = getModuleProgress(module);
            const hasCurrentLesson = module.lessons.some(l => l.id === currentLessonId);

            return (
              <div key={module.id} className="mb-2">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    "hover:bg-muted/50",
                    hasCurrentLesson && "bg-primary/10 border border-primary/30"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                    progress.percentage === 100 
                      ? "bg-success/20 text-success" 
                      : "bg-primary/20 text-primary"
                  )}>
                    {progress.percentage === 100 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      module.module_number
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {module.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {progress.completed}/{progress.total} completadas
                    </p>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Lessons List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-6 pr-2 py-1 space-y-1">
                        {module.lessons.map((lesson) => {
                          const Icon = lessonTypeIcons[lesson.type] || Play;
                          const isCurrent = lesson.id === currentLessonId;

                          return (
                            <motion.button
                              key={lesson.id}
                              onClick={() => !lesson.locked && onLessonSelect(lesson.id)}
                              disabled={lesson.locked}
                              whileHover={{ x: lesson.locked ? 0 : 4 }}
                              whileTap={{ scale: lesson.locked ? 1 : 0.98 }}
                              aria-current={isCurrent ? "page" : undefined}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm",
                                isCurrent 
                                  ? "bg-primary text-primary-foreground shadow-md" 
                                  : lesson.completed
                                    ? "bg-success/10 hover:bg-success/20"
                                    : "hover:bg-muted/50",
                                lesson.locked && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full shrink-0",
                                isCurrent 
                                  ? "bg-primary-foreground/20" 
                                  : lesson.completed
                                    ? "bg-success/20 text-success"
                                    : "bg-muted/50 text-muted-foreground"
                              )}>
                                {lesson.locked ? (
                                  <Lock className="h-3.5 w-3.5" />
                                ) : lesson.completed ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <Icon className="h-3.5 w-3.5" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  "font-medium truncate",
                                  lesson.completed && !isCurrent && "text-muted-foreground"
                                )}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs opacity-70">
                                  <span>{lessonTypeLabels[lesson.type]}</span>
                                  {lesson.duration_minutes && (
                                    <>
                                      <span>•</span>
                                      <span>{lesson.duration_minutes} min</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
