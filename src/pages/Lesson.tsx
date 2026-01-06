import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { useLessonData } from "@/hooks/useLessonData";
import { CourseLayoutOS } from "@/layouts/CourseLayoutOS";
import { LessonContent } from "@/components/course/LessonContent";
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
    if (current) {
      const currentModule = modules.find(m => m.id === current.moduleId);
      if (currentModule) {
        const completedInModule = currentModule.lessons.filter(l => l.completed).length;
        moduleProgress = (completedInModule / currentModule.lessons.length) * 100;
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
    };
  }, [modules, id]);

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
      <ChatBot />
    </>
  );
};

export default Lesson;
