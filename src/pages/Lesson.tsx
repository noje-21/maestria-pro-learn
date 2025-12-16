import { useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { useLessonData } from "@/hooks/useLessonData";
import { CourseLayoutOS } from "@/layouts/CourseLayoutOS";
import { LessonContent } from "@/components/course/LessonContent";

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

  const adjacentLessons = useMemo(() => {
    const allLessons = modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === id);
    
    return {
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLessons.length - 1,
      previousId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
      nextId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
    };
  }, [modules, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando lección...</p>
        </div>
      </div>
    );
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
          moduleName={currentModuleName}
          instructorName={instructorName}
          completed={completed}
          onComplete={handleComplete}
          onNextLesson={() => adjacentLessons.nextId && navigate(`/lesson/${adjacentLessons.nextId}`)}
          onPreviousLesson={() => adjacentLessons.previousId && navigate(`/lesson/${adjacentLessons.previousId}`)}
          hasNext={adjacentLessons.hasNext}
          hasPrevious={adjacentLessons.hasPrevious}
        />
      </CourseLayoutOS>
      <ChatBot />
    </>
  );
};

export default Lesson;
