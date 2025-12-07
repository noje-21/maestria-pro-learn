import { useState } from "react";
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
const Confetti = () => {
  const colors = ["#213ECC", "#CE2020", "#10B981", "#F59E0B", "#8B5CF6"];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 100,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 2.5 + Math.random() * 1.5,
            delay: Math.random() * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export const LessonFooter = ({
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
      }, 3000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-4 md:p-5 shadow-lg"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onPreviousLesson}
            disabled={!hasPrevious}
            className={cn(
              "gap-2 w-full sm:w-auto min-w-[140px] h-11 font-medium",
              !hasPrevious && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Lección Anterior</span>
            <span className="sm:hidden">Anterior</span>
          </Button>

          {/* Complete Button */}
          <motion.div
            whileHover={{ scale: completed ? 1 : 1.02 }}
            whileTap={{ scale: completed ? 1 : 0.98 }}
            className="w-full sm:w-auto"
          >
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={completed}
              className={cn(
                "gap-2 w-full sm:w-auto min-w-[180px] h-12 text-base font-semibold transition-all",
                completed 
                  ? "bg-success/20 text-success border-2 border-success/30 hover:bg-success/20"
                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
              )}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Completada
                </>
              ) : justCompleted ? (
                <>
                  <PartyPopper className="h-5 w-5" />
                  ¡Listo!
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Marcar Completada
                </>
              )}
            </Button>
          </motion.div>

          {/* Next Button */}
          <Button
            size="lg"
            onClick={onNextLesson}
            disabled={!hasNext}
            className={cn(
              "gap-2 w-full sm:w-auto min-w-[140px] h-11 font-medium",
              hasNext 
                ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="hidden sm:inline">Siguiente Lección</span>
            <span className="sm:hidden">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};
