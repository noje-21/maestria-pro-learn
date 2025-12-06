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
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
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
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border py-4 mt-8 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={onPreviousLesson}
            disabled={!hasPrevious}
            className={cn(
              "gap-2 min-w-[160px] h-12",
              !hasPrevious && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            Lección Anterior
          </Button>

          {/* Complete Button */}
          <motion.div
            whileHover={{ scale: completed ? 1 : 1.02 }}
            whileTap={{ scale: completed ? 1 : 0.98 }}
          >
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={completed}
              className={cn(
                "gap-2 min-w-[200px] h-14 text-lg font-semibold transition-all",
                completed 
                  ? "bg-success/20 text-success border-2 border-success/30 hover:bg-success/20"
                  : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
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
                  ¡Completada!
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Marcar como Completada
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
              "gap-2 min-w-[160px] h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
              !hasNext && "opacity-50 cursor-not-allowed"
            )}
          >
            Siguiente Lección
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};
