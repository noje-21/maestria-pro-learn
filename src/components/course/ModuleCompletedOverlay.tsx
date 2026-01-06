import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModuleCompletedOverlayProps {
  isOpen: boolean;
  moduleName: string;
  moduleNumber: number;
  lessonsCompleted: number;
  estimatedMinutes: number;
  hasNextModule: boolean;
  nextModuleName?: string;
  onContinue: () => void;
  onBackToCourse: () => void;
  onClose: () => void;
}

const ModuleCompletedOverlayComponent = ({
  isOpen,
  moduleName,
  moduleNumber,
  lessonsCompleted,
  estimatedMinutes,
  hasNextModule,
  nextModuleName,
  onContinue,
  onBackToCourse,
  onClose,
}: ModuleCompletedOverlayProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1 
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="relative overflow-hidden border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
              {/* Premium gradient decoration */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5 pointer-events-none" />

              <div className="relative p-6 md:p-8 space-y-6">
                {/* Success Icon */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-emerald-500" />
                    </div>
                    {/* Decorative rings */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatDelay: 0.5 
                      }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                    />
                  </div>
                </motion.div>

                {/* Title */}
                <div className="text-center space-y-2">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold text-foreground"
                  >
                    ¡Hito completado!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-muted-foreground"
                  >
                    Has dominado el Hito {moduleNumber}
                  </motion.p>
                </div>

                {/* Module Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <p className="text-lg font-semibold text-foreground">
                    {moduleName}
                  </p>
                </motion.div>

                {/* Stats Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-center justify-center gap-6 py-4 border-y border-border/50"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">{lessonsCompleted}</span>
                      {" "}{lessonsCompleted === 1 ? "paso completado" : "pasos completados"}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      <span className="font-semibold text-foreground">~{estimatedMinutes}</span>
                      {" "}minutos invertidos
                    </span>
                  </div>
                </motion.div>

                {/* Encouraging message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  {hasNextModule 
                    ? "Excelente avance. Continúa construyendo tu conocimiento."
                    : "Has recorrido un gran camino. ¡Sigue adelante!"}
                </motion.p>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {hasNextModule ? (
                    <Button
                      onClick={onContinue}
                      size="lg"
                      className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                    >
                      <Sparkles className="h-4 w-4" />
                      Continuar al siguiente hito
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={onBackToCourse}
                      size="lg"
                      className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 font-semibold"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ver resumen del curso
                    </Button>
                  )}
                  
                  <Button
                    onClick={onBackToCourse}
                    variant="outline"
                    size="lg"
                    className="gap-2 border-border/50 hover:bg-muted/50"
                  >
                    <BookOpen className="h-4 w-4" />
                    Volver al curso
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModuleCompletedOverlay = memo(ModuleCompletedOverlayComponent);
