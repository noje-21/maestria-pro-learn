import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Maximize2, Minimize2, PanelLeftClose, ArrowLeft, ChevronRight, ChevronLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { LessonSidebar } from "@/components/course/LessonSidebar";
import type { ModuleData } from "@/components/course/LessonSidebar";
import { cn } from "@/lib/utils";

interface CourseLayoutOSProps {
  courseId: string;
  courseTitle: string;
  modules: ModuleData[];
  currentLessonId: string;
  progress: number;
  children: React.ReactNode;
  onLessonSelect: (lessonId: string) => void;
  materials?: any[];
  onComplete?: () => void;
}

// Progress Bar Component
const ProgressIndicator = memo(({ progress, compact = false }: { progress: number; compact?: boolean }) => {
  const displayProgress = Math.min(Math.max(0, progress), 100);
  const isComplete = displayProgress === 100;
  
  return (
    <div className={cn("flex items-center gap-2", compact ? "w-full" : "w-32")}>
      <div className={cn(
        "flex-1 bg-muted/50 rounded-full overflow-hidden",
        compact ? "h-1.5" : "h-2"
      )}>
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            isComplete ? "bg-green-500" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className={cn(
        "font-bold tabular-nums shrink-0",
        compact ? "text-xs" : "text-sm",
        isComplete ? "text-green-500" : "text-primary"
      )}>
        {displayProgress}%
      </span>
    </div>
  );
});

ProgressIndicator.displayName = "ProgressIndicator";

// Course Position Indicator
const PositionIndicator = memo(({ 
  moduleNumber, 
  moduleName, 
  lessonNumber,
  totalLessonsInModule,
  compact = false 
}: { 
  moduleNumber: number;
  moduleName: string;
  lessonNumber: number;
  totalLessonsInModule: number;
  compact?: boolean;
}) => (
  <div className={cn(
    "flex items-center gap-2 text-muted-foreground",
    compact && "flex-wrap"
  )}>
    <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/20 text-primary font-medium">
      <BookOpen className="h-3 w-3" />
      <span>Módulo {moduleNumber}</span>
    </Badge>
    <ChevronRight className="h-3 w-3 shrink-0 hidden sm:block" />
    <span className="text-xs sm:text-sm truncate max-w-[200px]">
      Lección {lessonNumber} de {totalLessonsInModule}
    </span>
  </div>
));

PositionIndicator.displayName = "PositionIndicator";

// Navigation Arrows Component
const LessonNavigation = memo(({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  compact = false
}: {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  compact?: boolean;
}) => (
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={onPrevious}
      disabled={!hasPrevious}
      className={cn(
        "transition-all",
        !hasPrevious && "opacity-40 cursor-not-allowed",
        compact ? "h-8 w-8" : "gap-1"
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      {!compact && <span className="hidden lg:inline">Anterior</span>}
    </Button>
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      onClick={onNext}
      disabled={!hasNext}
      className={cn(
        "transition-all",
        !hasNext && "opacity-40 cursor-not-allowed",
        compact ? "h-8 w-8" : "gap-1"
      )}
    >
      {!compact && <span className="hidden lg:inline">Siguiente</span>}
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
));

LessonNavigation.displayName = "LessonNavigation";

const CourseLayoutOSComponent = ({
  courseId,
  courseTitle,
  modules,
  currentLessonId,
  progress,
  children,
  onLessonSelect,
  materials = [],
  onComplete,
}: CourseLayoutOSProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isImmersive, setIsImmersive] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Calculate current lesson position
  const lessonPosition = useMemo(() => {
    let moduleInfo = { number: 0, name: "", lessonNumber: 0, totalInModule: 0 };
    let allLessons: { id: string; moduleNumber: number; moduleName: string; lessonInModule: number; totalInModule: number }[] = [];
    
    for (const module of modules) {
      for (let i = 0; i < module.lessons.length; i++) {
        allLessons.push({
          id: module.lessons[i].id,
          moduleNumber: module.module_number,
          moduleName: module.title,
          lessonInModule: i + 1,
          totalInModule: module.lessons.length,
        });
      }
    }
    
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    const current = allLessons[currentIndex];
    
    if (current) {
      moduleInfo = {
        number: current.moduleNumber,
        name: current.moduleName,
        lessonNumber: current.lessonInModule,
        totalInModule: current.totalInModule,
      };
    }
    
    return {
      ...moduleInfo,
      currentIndex,
      totalLessons: allLessons.length,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLessons.length - 1,
      previousId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
      nextId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
    };
  }, [modules, currentLessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowRight" && lessonPosition.hasNext && lessonPosition.nextId) {
        onLessonSelect(lessonPosition.nextId);
      } else if (e.key === "ArrowLeft" && lessonPosition.hasPrevious && lessonPosition.previousId) {
        onLessonSelect(lessonPosition.previousId);
      }

      if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        setIsImmersive(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lessonPosition, onLessonSelect]);

  const toggleImmersive = useCallback(() => {
    setIsImmersive(prev => !prev);
  }, []);

  const handleLessonSelectMobile = useCallback((id: string) => {
    onLessonSelect(id);
    setMobileDrawerOpen(false);
  }, [onLessonSelect]);

  const handleBackToCourse = useCallback(() => {
    navigate(`/course/${courseId}`);
  }, [navigate, courseId]);

  const handlePreviousLesson = useCallback(() => {
    if (lessonPosition.previousId) {
      onLessonSelect(lessonPosition.previousId);
    }
  }, [lessonPosition.previousId, onLessonSelect]);

  const handleNextLesson = useCallback(() => {
    if (lessonPosition.nextId) {
      onLessonSelect(lessonPosition.nextId);
    }
  }, [lessonPosition.nextId, onLessonSelect]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToCourse}
              className="shrink-0 h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{courseTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <ProgressIndicator progress={progress} compact />
              </div>
            </div>

            <LessonNavigation
              hasPrevious={lessonPosition.hasPrevious}
              hasNext={lessonPosition.hasNext}
              onPrevious={handlePreviousLesson}
              onNext={handleNextLesson}
              compact
            />
          </div>
          
          {/* Position indicator for mobile */}
          <div className="px-3 pb-2">
            <PositionIndicator
              moduleNumber={lessonPosition.number}
              moduleName={lessonPosition.name}
              lessonNumber={lessonPosition.lessonNumber}
              totalLessonsInModule={lessonPosition.totalInModule}
              compact
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLessonId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Index Button */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="fixed bottom-6 left-4 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30"
            >
              <Menu className="h-5 w-5" />
              <span className="text-sm font-semibold">Índice</span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[90vw] max-w-[360px] p-0 bg-background">
            <SheetHeader className="p-4 border-b border-border/50">
              <SheetTitle className="text-left">Contenido del curso</SheetTitle>
            </SheetHeader>
            <LessonSidebar
              modules={modules}
              currentLessonId={currentLessonId}
              onLessonSelect={handleLessonSelectMobile}
              showSearch={true}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <header className="shrink-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-4 px-4 h-14">
          {/* Back Button & Course Title */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToCourse}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden lg:inline">Volver al curso</span>
            </Button>
            <div className="hidden md:block h-5 w-px bg-border" />
            <h1 className="hidden md:block text-sm font-semibold truncate max-w-[200px] lg:max-w-[300px]">
              {courseTitle}
            </h1>
          </div>

          {/* Center: Position Indicator */}
          <div className="flex-1 flex justify-center">
            <PositionIndicator
              moduleNumber={lessonPosition.number}
              moduleName={lessonPosition.name}
              lessonNumber={lessonPosition.lessonNumber}
              totalLessonsInModule={lessonPosition.totalInModule}
            />
          </div>

          {/* Right: Progress & Navigation */}
          <div className="flex items-center gap-3 shrink-0">
            <ProgressIndicator progress={progress} />
            <div className="h-5 w-px bg-border hidden sm:block" />
            <LessonNavigation
              hasPrevious={lessonPosition.hasPrevious}
              hasNext={lessonPosition.hasNext}
              onPrevious={handlePreviousLesson}
              onNext={handleNextLesson}
            />
          </div>
        </div>
      </header>

      {/* Main 2-Panel Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel - Lesson Sidebar */}
        <AnimatePresence mode="wait" initial={false}>
          {!isImmersive && leftPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="shrink-0 border-r border-border/50 bg-card/30 overflow-hidden"
            >
              <div className="h-full overflow-y-auto overscroll-contain">
                <LessonSidebar
                  modules={modules}
                  currentLessonId={currentLessonId}
                  onLessonSelect={onLessonSelect}
                  showSearch={true}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center - Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto overscroll-contain relative">
          {/* Panel Controls */}
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            {!isImmersive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftPanelOpen(prev => !prev)}
                className="h-9 w-9 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
                title={leftPanelOpen ? "Ocultar índice" : "Mostrar índice"}
              >
                <PanelLeftClose className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  !leftPanelOpen && "rotate-180"
                )} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleImmersive}
              className="h-9 w-9 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
              title={isImmersive ? "Salir del modo inmersivo (F)" : "Modo inmersivo (F)"}
            >
              {isImmersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Animated Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLessonId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export const CourseLayoutOS = memo(CourseLayoutOSComponent);
