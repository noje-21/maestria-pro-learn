import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LessonFooterProps {
  completed: boolean;
  onComplete: () => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Confetti particles component
const Confetti = memo(() => {
  const colors = ["#213ECC", "#CE2020", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            backgroundColor: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            rotate: Math.random() * 720 - 360,
            x: (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
});

Confetti.displayName = "Confetti";

const LessonFooterComponent = ({
  completed,
  onComplete,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
}: LessonFooterProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = () => {
    if (!completed) {
      setShowConfetti(true);
      setJustCompleted(true);
      onComplete();

      // Hide confetti after animation
      setTimeout(() => {
        setShowConfetti(false);
      }, 3500);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-4 md:p-5 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Button */}
          <motion.div whileHover={{ x: hasPrevious ? -2 : 0 }} whileTap={{ scale: hasPrevious ? 0.98 : 1 }}>
            <Button
              variant="outline"
              size="lg"
              onClick={onPreviousLesson}
              disabled={!hasPrevious}
              className={cn(
                "gap-2 w-full sm:w-auto min-w-[140px] h-11 font-medium border-border/50",
                !hasPrevious && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Lección Anterior</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
          </motion.div>

          {/* Complete Button */}
          <motion.div
            whileHover={{ scale: completed ? 1 : 1.03 }}
            whileTap={{ scale: completed ? 1 : 0.97 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={completed}
              className={cn(
                "gap-2 w-full sm:w-auto min-w-[180px] h-12 text-base font-semibold transition-all",
                completed
                  ? "bg-green-500/20 text-green-500 border-2 border-green-500/30 hover:bg-green-500/20"
                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
              )}
            >
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.span
                    key="completed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Completada
                  </motion.span>
                ) : justCompleted ? (
                  <motion.span
                    key="just-completed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <PartyPopper className="h-5 w-5" />
                    ¡Listo!
                  </motion.span>
                ) : (
                  <motion.span
                    key="not-completed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Marcar Completada
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Next Button */}
          <motion.div whileHover={{ x: hasNext ? 2 : 0 }} whileTap={{ scale: hasNext ? 0.98 : 1 }}>
            <Button
              size="lg"
              onClick={onNextLesson}
              disabled={!hasNext}
              className={cn(
                "gap-2 w-full sm:w-auto min-w-[140px] h-11 font-medium",
                hasNext
                  ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="hidden sm:inline">Siguiente Lección</span>
              <span className="sm:hidden">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export const LessonFooter = memo(LessonFooterComponent);
