import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Maximize2, Minimize2, PanelLeftClose, PanelRightClose, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { LessonSidebar } from "@/components/course/LessonSidebar";
import type { ModuleData } from "@/components/course/LessonSidebar";
import { LessonSidePanel } from "@/components/course/LessonSidePanel";
import { CourseProgressBar } from "@/components/course/CourseProgressBar";

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
  const [isImmersive, setIsImmersive] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const allLessons = modules.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);

        if (e.key === "ArrowRight" && currentIndex < allLessons.length - 1) {
          onLessonSelect(allLessons[currentIndex + 1].id);
        } else if (e.key === "ArrowLeft" && currentIndex > 0) {
          onLessonSelect(allLessons[currentIndex - 1].id);
        }
      }

      if (e.key === "f" && !e.ctrlKey && !e.metaKey) {
        setIsImmersive(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLessonId, modules, onLessonSelect]);

  const toggleImmersive = useCallback(() => {
    setIsImmersive(prev => !prev);
  }, []);

  const handleLessonSelectMobile = useCallback((id: string) => {
    onLessonSelect(id);
    setMobileDrawerOpen(false);
  }, [onLessonSelect]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile Progress Bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <CourseProgressBar
            progress={progress}
            courseTitle={courseTitle}
            compact
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 pb-24">
          {children}

          {/* Side panel inline for mobile */}
          <div className="border-t border-border/50 bg-card/30 mt-6">
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

  // Desktop Layout - 3 Panels
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Progress Bar */}
      <div className="shrink-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <CourseProgressBar
          progress={progress}
          courseTitle={courseTitle}
        />
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex min-h-0">
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
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLeftPanelOpen(prev => !prev)}
                  className="h-9 w-9 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
                  title={leftPanelOpen ? "Ocultar índice" : "Mostrar índice"}
                >
                  <PanelLeftClose className={`h-4 w-4 transition-transform duration-200 ${!leftPanelOpen ? 'rotate-180' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightPanelOpen(prev => !prev)}
                  className="h-9 w-9 bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background shadow-sm"
                  title={rightPanelOpen ? "Ocultar recursos" : "Mostrar recursos"}
                >
                  <PanelRightClose className={`h-4 w-4 transition-transform duration-200 ${!rightPanelOpen ? 'rotate-180' : ''}`} />
                </Button>
              </>
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

          {children}
        </main>

        {/* Right Panel - Resources & Notes */}
        <AnimatePresence mode="wait" initial={false}>
          {!isImmersive && rightPanelOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="shrink-0 border-l border-border/50 bg-card/30 overflow-hidden"
            >
              <div className="h-full overflow-y-auto overscroll-contain">
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

export const CourseLayoutOS = memo(CourseLayoutOSComponent);
