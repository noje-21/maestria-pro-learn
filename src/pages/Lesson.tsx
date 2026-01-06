import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { useLessonData } from "@/hooks/useLessonData";
import { CourseLayoutOS } from "@/layouts/CourseLayoutOS";
import { LessonContent } from "@/components/course/LessonContent";
import { ModuleCompletedOverlay } from "@/components/course/ModuleCompletedOverlay";
import { Skeleton } from "@/components/ui/skeleton";

const LessonLoadingSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="h-14 border-b border-border/50 flex items-center px-4 gap-4">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-5 w-32" />
      <div className="flex-1" />
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="flex-1 flex">
      <div className="w-80 border-r border-border/50 p-4 space-y-4 hidden lg:block">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="aspect-video w-full max-w-5xl mx-auto rounded-2xl" />
        <div className="max-w-5xl mx-auto mt-6 space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
    </div>
  </div>
);

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    lesson,
    videos,
    materials,
    modules,
    courseId,
    courseTitle,
    courseProgress,
    currentModuleName,
    instructorName,
    completed,
    loading,
    handleComplete,
  } = useLessonData(id, user?.id);

  // Module completion overlay state
  const [showModuleCompleted, setShowModuleCompleted] = useState(false);
  const [completedModuleInfo, setCompletedModuleInfo] = useState<{
    name: string;
    number: number;
    lessonsCount: number;
    duration: number;
    nextModuleFirstLessonId: string | null;
    nextModuleName: string | null;
  } | null>(null);

  const handleLessonSelect = useCallback((lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  }, [navigate]);

  // Calculate adjacent lessons and module info from modules
  const lessonInfo = useMemo(() => {
    const allLessons: Array<{
      id: string;
      moduleId: string;
      moduleNumber: number;
      moduleName: string;
      lessonNumber: number;
      totalInModule: number;
    }> = [];
    
    modules.forEach(m => {
      m.lessons.forEach((l, idx) => {
        allLessons.push({
          id: l.id,
          moduleId: m.id,
          moduleNumber: m.module_number,
          moduleName: m.title,
          lessonNumber: idx + 1,
          totalInModule: m.lessons.length,
        });
      });
    });
    
    const currentIndex = allLessons.findIndex(l => l.id === id);
    const current = allLessons[currentIndex];
    
    // Calculate module progress
    let moduleProgress = 0;
    let currentModuleData = null;
    let nextModuleData = null;
    
    if (current) {
      const currentModuleIdx = modules.findIndex(m => m.id === current.moduleId);
      currentModuleData = modules[currentModuleIdx];
      
      if (currentModuleData) {
        const completedInModule = currentModuleData.lessons.filter(l => l.completed).length;
        moduleProgress = (completedInModule / currentModuleData.lessons.length) * 100;
      }
      
      // Get next module info
      if (currentModuleIdx < modules.length - 1) {
        nextModuleData = modules[currentModuleIdx + 1];
      }
    }
    
    return {
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLessons.length - 1,
      previousId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
      nextId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
      moduleNumber: current?.moduleNumber || 1,
      lessonNumber: current?.lessonNumber || 1,
      totalInModule: current?.totalInModule || 1,
      moduleProgress,
      currentModuleData,
      nextModuleData,
      isLastLessonInModule: current?.lessonNumber === current?.totalInModule,
    };
  }, [modules, id]);

  // Detect module completion
  const [prevModuleProgress, setPrevModuleProgress] = useState<number | null>(null);
  
  useEffect(() => {
    // Only check when we have valid data and lesson was just completed
    if (
      lessonInfo.moduleProgress === 100 && 
      prevModuleProgress !== null && 
      prevModuleProgress < 100 &&
      lessonInfo.currentModuleData &&
      completed
    ) {
      // Module just became 100% - show overlay
      const totalDuration = lessonInfo.currentModuleData.lessons.reduce(
        (acc, l) => acc + (l.duration_minutes || 0), 0
      );
      
      setCompletedModuleInfo({
        name: lessonInfo.currentModuleData.title,
        number: lessonInfo.currentModuleData.module_number,
        lessonsCount: lessonInfo.currentModuleData.lessons.length,
        duration: totalDuration,
        nextModuleFirstLessonId: lessonInfo.nextModuleData?.lessons[0]?.id || null,
        nextModuleName: lessonInfo.nextModuleData?.title || null,
      });
      setShowModuleCompleted(true);
    }
    
    setPrevModuleProgress(lessonInfo.moduleProgress);
  }, [lessonInfo.moduleProgress, completed]);

  // Reset on lesson change
  useEffect(() => {
    setShowModuleCompleted(false);
    setPrevModuleProgress(null);
  }, [id]);

  const handleContinueToNextModule = useCallback(() => {
    if (completedModuleInfo?.nextModuleFirstLessonId) {
      setShowModuleCompleted(false);
      navigate(`/lesson/${completedModuleInfo.nextModuleFirstLessonId}`);
    }
  }, [completedModuleInfo, navigate]);

  const handleBackToCourse = useCallback(() => {
    setShowModuleCompleted(false);
    if (courseId) {
      navigate(`/course/${courseId}`);
    }
  }, [courseId, navigate]);

  if (loading) {
    return <LessonLoadingSkeleton />;
  }

  if (!lesson) return null;

  return (
    <>
      <CourseLayoutOS
        courseId={courseId || ""}
        courseTitle={courseTitle}
        modules={modules}
        currentLessonId={id || ""}
        progress={courseProgress}
        onLessonSelect={handleLessonSelect}
        materials={materials}
        onComplete={handleComplete}
      >
        <LessonContent
          lesson={lesson}
          videos={videos}
          materials={materials}
          moduleName={currentModuleName}
          moduleNumber={lessonInfo.moduleNumber}
          lessonNumber={lessonInfo.lessonNumber}
          totalLessonsInModule={lessonInfo.totalInModule}
          moduleProgress={lessonInfo.moduleProgress}
          instructorName={instructorName}
          completed={completed}
          onComplete={handleComplete}
          onNextLesson={() => lessonInfo.nextId && navigate(`/lesson/${lessonInfo.nextId}`)}
          onPreviousLesson={() => lessonInfo.previousId && navigate(`/lesson/${lessonInfo.previousId}`)}
          hasNext={lessonInfo.hasNext}
          hasPrevious={lessonInfo.hasPrevious}
        />
      </CourseLayoutOS>

      {/* Module Completed Overlay */}
      <ModuleCompletedOverlay
        isOpen={showModuleCompleted}
        moduleName={completedModuleInfo?.name || ""}
        moduleNumber={completedModuleInfo?.number || 1}
        lessonsCompleted={completedModuleInfo?.lessonsCount || 0}
        estimatedMinutes={completedModuleInfo?.duration || 0}
        hasNextModule={!!completedModuleInfo?.nextModuleFirstLessonId}
        nextModuleName={completedModuleInfo?.nextModuleName || undefined}
        onContinue={handleContinueToNextModule}
        onBackToCourse={handleBackToCourse}
        onClose={() => setShowModuleCompleted(false)}
      />

      <ChatBot />
    </>
  );
};

export default Lesson;
