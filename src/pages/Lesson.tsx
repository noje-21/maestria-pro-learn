import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CourseLayoutOS } from "@/layouts/CourseLayoutOS";
import { LessonContent } from "@/components/course/LessonContent";

interface LessonData {
  id: string;
  title: string;
  description: string;
  duration_minutes?: number;
  image_url?: string | null;
  module_id: string;
}

interface Video {
  id: string;
  video_url: string;
  title: string | null;
  order_number: number;
}

interface Material {
  id: string;
  title: string;
  file_url: string;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  course_id: string;
  lessons: Array<{
    id: string;
    lesson_number: number;
    title: string;
    description: string;
    duration_minutes: number;
    completed: boolean;
    type: 'video' | 'pdf' | 'quiz' | 'audio';
  }>;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseProgress, setCourseProgress] = useState(0);
  const [currentModuleName, setCurrentModuleName] = useState("");
  const [instructorName, setInstructorName] = useState("");

  useEffect(() => {
    if (user && id) {
      loadLesson();
    }
  }, [user, id]);

  const loadLesson = async () => {
    if (!id) return;
    try {
      // Load lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*, modules(id, title, instructor, course_id, module_number)")
        .eq("id", id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        toast({
          title: "Error",
          description: "Lección no encontrada",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setLesson(lessonData);
      const moduleData = lessonData.modules as any;
      setCurrentModuleName(moduleData?.title || "");
      setInstructorName(moduleData?.instructor || "");
      const currentCourseId = moduleData?.course_id;
      setCourseId(currentCourseId);

      // Load course info
      if (currentCourseId) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("title")
          .eq("id", currentCourseId)
          .single();
        
        if (courseData) {
          setCourseTitle(courseData.title);
        }

        // Load all modules with lessons for sidebar
        const { data: modulesData } = await supabase
          .from("modules")
          .select("*")
          .eq("course_id", currentCourseId)
          .eq("is_active", true)
          .order("module_number");

        if (modulesData) {
          const modulesWithLessons = await Promise.all(
            modulesData.map(async (module) => {
              const { data: lessonsData } = await supabase
                .from("lessons")
                .select("*")
                .eq("module_id", module.id)
                .eq("is_active", true)
                .order("lesson_number");

              // Get user progress for lessons
              const { data: progressData } = await supabase
                .from("user_progress")
                .select("lesson_id, completed")
                .eq("user_id", user!.id)
                .in("lesson_id", (lessonsData || []).map(l => l.id));

              const progressMap = new Map(
                (progressData || []).map(p => [p.lesson_id, p.completed])
              );

              return {
                ...module,
                lessons: (lessonsData || []).map(l => ({
                  id: l.id,
                  lesson_number: l.lesson_number,
                  title: l.title,
                  description: l.description || "",
                  duration_minutes: l.duration_minutes || 0,
                  completed: progressMap.get(l.id) || false,
                  type: "video" as const,
                })),
              };
            })
          );
          setModules(modulesWithLessons);

          // Calculate progress
          const totalLessons = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
          const completedLessons = modulesWithLessons.reduce(
            (acc, m) => acc + m.lessons.filter(l => l.completed).length,
            0
          );
          setCourseProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
        }
      }

      // Load videos
      const { data: videosData } = await supabase
        .from("lesson_videos")
        .select("*")
        .eq("lesson_id", id)
        .order("order_number");
      setVideos(videosData || []);

      // Load materials
      const { data: materialsData } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", id)
        .order("created_at");
      setMaterials(materialsData || []);

      // Load progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", user!.id)
        .eq("lesson_id", id)
        .maybeSingle();

      setCompleted(progressData?.completed || false);
    } catch (error: any) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lección",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !id || completed) return;
    
    // Optimistic update
    setCompleted(true);
    
    try {
      const { error } = await supabase.rpc("mark_lesson_viewed", {
        _lesson_id: id,
      });

      if (error) throw error;

      toast({
        title: "¡Lección completada!",
        description: "Tu progreso ha sido guardado.",
      });
      
      // Update progress
      setCourseProgress(prev => {
        const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
        return Math.min(100, prev + Math.round(100 / totalLessons));
      });
    } catch (error: any) {
      // Rollback on error
      setCompleted(false);
      console.error("Error marking lesson as viewed:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar la lección como vista",
        variant: "destructive",
      });
    }
  };

  const handleLessonSelect = useCallback((lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  }, [navigate]);

  const getAdjacentLessons = () => {
    const allLessons = modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === id);
    
    return {
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLessons.length - 1,
      previousId: currentIndex > 0 ? allLessons[currentIndex - 1].id : null,
      nextId: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null,
    };
  };

  const { hasPrevious, hasNext, previousId, nextId } = getAdjacentLessons();

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
          onNextLesson={() => nextId && navigate(`/lesson/${nextId}`)}
          onPreviousLesson={() => previousId && navigate(`/lesson/${previousId}`)}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </CourseLayoutOS>
      <ChatBot />
    </>
  );
};

export default Lesson;
