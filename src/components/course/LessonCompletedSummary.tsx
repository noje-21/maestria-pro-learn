import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LessonCompletedSummaryProps {
  isVisible: boolean;
  lessonTitle: string;
  moduleName: string;
  lessonNumber: number;
  totalLessonsInModule: number;
  moduleProgress: number;
  hasNextLesson: boolean;
  onNextLesson: () => void;
  onDismiss: () => void;
}

// Helper function for human-friendly progress messages
const getProgressMessage = (progress: number, lessonNumber: number, totalLessons: number): string => {
  if (progress >= 100) {
    return "¡Has completado este hito!";
  }
  
  const fraction = lessonNumber / totalLessons;
  
  if (fraction <= 0.25) {
    return "Buen comienzo. Estás construyendo una base sólida.";
  }
  if (fraction <= 0.5) {
    return "Vas a la mitad del hito. ¡Sigue así!";
  }
  if (fraction <= 0.75) {
    return "Ya superaste la parte central. Casi llegas.";
  }
  return "Estás en la recta final de este hito.";
};

// Get encouragement based on progress
const getEncouragement = (moduleProgress: number): string => {
  if (moduleProgress >= 100) return "¡Excelente trabajo!";
  if (moduleProgress >= 75) return "¡Casi lo logras!";
  if (moduleProgress >= 50) return "Buen avance";
  if (moduleProgress >= 25) return "Vas por buen camino";
  return "Primer paso completado";
};

const LessonCompletedSummaryComponent = ({
  isVisible,
  lessonTitle,
  moduleName,
  lessonNumber,
  totalLessonsInModule,
  moduleProgress,
  hasNextLesson,
  onNextLesson,
  onDismiss,
}: LessonCompletedSummaryProps) => {
  const progressMessage = getProgressMessage(moduleProgress, lessonNumber, totalLessonsInModule);
  const encouragement = getEncouragement(moduleProgress);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-gradient-to-br from-emerald-500/10 via-card to-primary/5 border border-emerald-500/20 rounded-2xl p-5 md:p-6 shadow-lg"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/15 shrink-0"
            >
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 font-medium">
                  <Sparkles className="h-3 w-3" />
                  {encouragement}
                </Badge>
              </div>

              {/* Progress Message */}
              <p className="text-foreground font-medium">
                {progressMessage}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span>Paso {lessonNumber} de {totalLessonsInModule}</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className={cn(
                    "font-semibold",
                    moduleProgress >= 100 ? "text-emerald-500" : "text-foreground"
                  )}>
                    {Math.round(moduleProgress)}% del hito
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            {hasNextLesson && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="shrink-0"
              >
                <Button
                  onClick={onNextLesson}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 font-semibold w-full md:w-auto"
                >
                  Siguiente paso
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LessonCompletedSummary = memo(LessonCompletedSummaryComponent);
