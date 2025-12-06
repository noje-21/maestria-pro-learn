import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Maximize2, Minimize2 } from "lucide-react";
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
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Progress Bar - Sticky */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
          <CourseProgressBar 
            progress={progress} 
            courseTitle={courseTitle}
            compact
          />
          
          {/* Mobile Controls */}
          <div className="flex items-center justify-between px-4 py-2">
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Menu className="h-4 w-4" />
                  Índice
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] p-0 bg-background">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleImmersive}
              className="gap-2"
            >
              {isImmersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Floating Index Button */}
        <AnimatePresence>
          {!mobileDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-24 right-4 z-40"
            >
              <Button
                size="lg"
                className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
                onClick={() => setMobileDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop Layout - 3 Panels
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <CourseProgressBar 
          progress={progress} 
          courseTitle={courseTitle}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Lesson Index */}
        <AnimatePresence>
          {!isImmersive && leftPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-r border-border bg-card/30 overflow-hidden flex-shrink-0"
            >
              <LessonIndexPanel
                modules={modules}
                currentLessonId={currentLessonId}
                onLessonSelect={onLessonSelect}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center - Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Immersive Toggle */}
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            {!isImmersive && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(prev => !prev)}
                  className="bg-background/80 backdrop-blur-sm"
                  title="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(prev => !prev)}
                  className="bg-background/80 backdrop-blur-sm"
                  title="Toggle resources"
                >
                  <Menu className="h-4 w-4 rotate-180" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleImmersive}
              className="bg-background/80 backdrop-blur-sm"
              title={isImmersive ? "Exit immersive (F)" : "Immersive mode (F)"}
            >
              {isImmersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          {children}
        </main>

        {/* Right Panel - Resources & Notes */}
        <AnimatePresence>
          {!isImmersive && rightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-l border-border bg-card/30 overflow-hidden flex-shrink-0"
            >
              <LessonSidePanel
                materials={materials}
                lessonId={currentLessonId}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
