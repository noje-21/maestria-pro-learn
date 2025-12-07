import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Maximize2, Minimize2, PanelLeftClose, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonIndexPanel } from "@/components/course/LessonIndexPanel";
import { LessonSidePanel } from "@/components/course/LessonSidePanel";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  description: string;
  duration_minutes: number;
  completed: boolean;
  type: 'video' | 'pdf' | 'quiz' | 'audio';
}

interface CourseLayoutOSProps {
  courseId: string;
  courseTitle: string;
  modules: Module[];
  currentLessonId: string;
  progress: number;
  children: React.ReactNode;
  onLessonSelect: (lessonId: string) => void;
  materials?: any[];
  onComplete?: () => void;
}

export const CourseLayoutOS = ({
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
  const [isImmersive, setIsImmersive] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const allLessons = modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        
        if (e.key === "ArrowRight" && currentIndex < allLessons.length - 1) {
          onLessonSelect(allLessons[currentIndex + 1].id);
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
          onLessonSelect(allLessons[currentIndex - 1].id);
        }
      }
      
      // Toggle immersive mode with 'F' key
      if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          setIsImmersive(prev => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLessonId, modules, onLessonSelect]);

  const toggleImmersive = useCallback(() => {
    setIsImmersive(prev => !prev);
  }, []);

  // Mobile Layout - Full scroll, no fixed heights
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Progress Bar - Sticky */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <CourseProgressBar 
            progress={progress} 
            courseTitle={courseTitle}
            compact
          />
        </div>

        {/* Main Content - Natural scroll */}
        <main className="flex-1">
          {children}
          
          {/* Side panel content inline for mobile */}
          <div className="border-t border-border/50 bg-card/30">
            <LessonSidePanel
              materials={materials}
              lessonId={currentLessonId}
            />
          </div>
        </main>

        {/* Floating Index Button */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed bottom-6 left-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">Índice</span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 bg-background">
            <LessonIndexPanel
              modules={modules}
              currentLessonId={currentLessonId}
              onLessonSelect={(id) => {
                onLessonSelect(id);
                setMobileDrawerOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // Desktop Layout - 3 Panels with proper overflow handling
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Progress Bar */}
      <div className="flex-shrink-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <CourseProgressBar 
          progress={progress} 
          courseTitle={courseTitle}
        />
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel - Lesson Index */}
        <AnimatePresence mode="wait">
          {!isImmersive && leftPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-shrink-0 border-r border-border/50 bg-card/30 overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <LessonIndexPanel
                  modules={modules}
                  currentLessonId={currentLessonId}
                  onLessonSelect={onLessonSelect}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center - Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto relative">
          {/* Panel Toggle Controls */}
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            {!isImmersive && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(prev => !prev)}
                  className="h-9 w-9 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
                  title={leftPanelOpen ? "Ocultar índice" : "Mostrar índice"}
                >
                  <PanelLeftClose className={`h-4 w-4 transition-transform ${!leftPanelOpen ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(prev => !prev)}
                  className="h-9 w-9 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
                  title={rightPanelOpen ? "Ocultar recursos" : "Mostrar recursos"}
                >
                  <PanelRightClose className={`h-4 w-4 transition-transform ${!rightPanelOpen ? 'rotate-180' : ''}`} />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleImmersive}
              className="h-9 w-9 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background"
              title={isImmersive ? "Salir del modo inmersivo (F)" : "Modo inmersivo (F)"}
            >
              {isImmersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          {children}
        </main>

        {/* Right Panel - Resources & Notes */}
        <AnimatePresence mode="wait">
          {!isImmersive && rightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-shrink-0 border-l border-border/50 bg-card/30 overflow-hidden"
            >
              <div className="h-full overflow-y-auto">
                <LessonSidePanel
                  materials={materials}
                  lessonId={currentLessonId}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
