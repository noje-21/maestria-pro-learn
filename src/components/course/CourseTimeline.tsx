import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Module {
  id: string;
  module_number: number;
  title: string;
  lessons_count: number;
  completed_count: number;
}

interface CourseTimelineProps {
  modules: Module[];
  currentModuleId?: string;
  onModuleClick?: (moduleId: string) => void;
}

export const CourseTimeline = ({
  modules,
  currentModuleId,
  onModuleClick,
}: CourseTimelineProps) => {
  const getModuleStatus = (module: Module, index: number) => {
    if (module.completed_count === module.lessons_count && module.lessons_count > 0) {
      return "completed";
    }
    if (module.id === currentModuleId || module.completed_count > 0) {
      return "in-progress";
    }
    // Check if previous module is completed
    if (index > 0) {
      const prevModule = modules[index - 1];
      if (prevModule.completed_count < prevModule.lessons_count) {
        return "locked";
      }
    }
    return "available";
  };

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-border" />

      <div className="space-y-2">
        {modules.map((module, index) => {
          const status = getModuleStatus(module, index);
          const isCurrent = module.id === currentModuleId;
          const progress = module.lessons_count > 0 
            ? Math.round((module.completed_count / module.lessons_count) * 100)
            : 0;

          return (
            <motion.button
              key={module.id}
              onClick={() => status !== "locked" && onModuleClick?.(module.id)}
              disabled={status === "locked"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: status !== "locked" ? 4 : 0 }}
              className={cn(
                "relative w-full flex items-start gap-4 p-3 rounded-lg text-left transition-all",
                status === "locked" && "opacity-50 cursor-not-allowed",
                status !== "locked" && "hover:bg-muted/50",
                isCurrent && "bg-primary/10 border border-primary/30"
              )}
            >
              {/* Status Icon */}
              <div className={cn(
                "relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                status === "completed" && "bg-success text-success-foreground",
                status === "in-progress" && "bg-primary text-primary-foreground",
                status === "available" && "bg-card border-2 border-primary text-primary",
                status === "locked" && "bg-muted border-2 border-muted-foreground/30 text-muted-foreground"
              )}>
                {status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : status === "in-progress" ? (
                  <Play className="h-5 w-5" />
                ) : status === "locked" ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Módulo {module.module_number}
                  </span>
                  {status === "completed" && (
                    <span className="text-xs text-success font-medium">
                      ✓ Completado
                    </span>
                  )}
                </div>
                <h4 className={cn(
                  "font-semibold truncate",
                  status === "locked" && "text-muted-foreground"
                )}>
                  {module.title}
                </h4>
                
                {/* Progress Bar */}
                {status !== "locked" && module.lessons_count > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          status === "completed"
                            ? "bg-success"
                            : "bg-primary"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {module.completed_count}/{module.lessons_count}
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
