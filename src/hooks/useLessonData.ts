import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

interface UseLessonDataResult {
  lesson: LessonData | null;
  videos: Video[];
  materials: Material[];
  modules: Module[];
  courseId: string | null;
  courseTitle: string;
  courseProgress: number;
  currentModuleName: string;
  instructorName: string;
  completed: boolean;
  loading: boolean;
  error: string | null;
  handleComplete: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useLessonData(lessonId: string | undefined, userId: string | undefined): UseLessonDataResult {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseProgress, setCourseProgress] = useState(0);
  const [currentModuleName, setCurrentModuleName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = useCallback(async () => {
    if (!lessonId || !userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Load lesson data with module info in single query
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*, modules(id, title, instructor, course_id, module_number)")
        .eq("id", lessonId)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        setError("Lección no encontrada");
        navigate("/dashboard");
        return;
      }

      setLesson(lessonData);
      const moduleData = lessonData.modules as any;
      setCurrentModuleName(moduleData?.title || "");
      setInstructorName(moduleData?.instructor || "");
      const currentCourseId = moduleData?.course_id;
      setCourseId(currentCourseId);

      // Parallel fetch all related data
      const fetchPromises = [];
      
      // Course title
      if (currentCourseId) {
        fetchPromises.push(
          supabase
            .from("courses")
            .select("title")
            .eq("id", currentCourseId)
            .single()
            .then(({ data }) => {
              if (data) setCourseTitle(data.title);
            })
        );

        // Modules with lessons - optimized with single query
        fetchPromises.push(
          supabase
            .from("modules")
            .select(`
              *,
              lessons!inner(id, lesson_number, title, description, duration_minutes, is_active)
            `)
            .eq("course_id", currentCourseId)
            .eq("is_active", true)
            .eq("lessons.is_active", true)
            .order("module_number")
            .then(async ({ data: modulesData }) => {
              if (!modulesData) return;
              
              // Get all lesson IDs
              const allLessonIds = modulesData.flatMap(m => 
                (m.lessons as any[]).map(l => l.id)
              );
              
              // Fetch progress for all lessons in one query
              const { data: progressData } = await supabase
                .from("user_progress")
                .select("lesson_id, completed")
                .eq("user_id", userId)
                .in("lesson_id", allLessonIds);

              const progressMap = new Map(
                (progressData || []).map(p => [p.lesson_id, p.completed])
              );

              const modulesWithLessons = modulesData.map(module => {
                const lessons = (module.lessons as any[])
                  .sort((a, b) => a.lesson_number - b.lesson_number)
                  .map(l => ({
                    id: l.id,
                    lesson_number: l.lesson_number,
                    title: l.title,
                    description: l.description || "",
                    duration_minutes: l.duration_minutes || 0,
                    completed: progressMap.get(l.id) || false,
                    type: "video" as const,
                  }));

                return {
                  ...module,
                  lessons,
                };
              });

              setModules(modulesWithLessons);

              // Calculate progress
              const totalLessons = modulesWithLessons.reduce((acc, m) => acc + m.lessons.length, 0);
              const completedLessons = modulesWithLessons.reduce(
                (acc, m) => acc + m.lessons.filter(l => l.completed).length,
                0
              );
              setCourseProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
            })
        );
      }

      // Videos
      fetchPromises.push(
        supabase
          .from("lesson_videos")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("order_number")
          .then(({ data }) => setVideos(data || []))
      );

      // Materials
      fetchPromises.push(
        supabase
          .from("lesson_materials")
          .select("*")
          .eq("lesson_id", lessonId)
          .order("created_at")
          .then(({ data }) => setMaterials(data || []))
      );

      // User progress for this lesson
      fetchPromises.push(
        supabase
          .from("user_progress")
          .select("completed")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .maybeSingle()
          .then(({ data }) => setCompleted(data?.completed || false))
      );

      await Promise.all(fetchPromises);
    } catch (err: any) {
      console.error("Error loading lesson:", err);
      setError(err.message || "No se pudo cargar la lección");
      toast({
        title: "Error",
        description: "No se pudo cargar la lección",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [lessonId, userId, navigate, toast]);

  const handleComplete = useCallback(async () => {
    if (!userId || !lessonId || completed) return;
    
    // Optimistic update
    setCompleted(true);
    const previousProgress = courseProgress;
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const newProgress = Math.min(100, courseProgress + Math.round(100 / totalLessons));
    setCourseProgress(newProgress);
    
    try {
      const { error } = await supabase.rpc("mark_lesson_viewed", {
        _lesson_id: lessonId,
      });

      if (error) throw error;

      toast({
        title: "¡Lección completada!",
        description: "Tu progreso ha sido guardado.",
      });
      
      // Update modules state with completed lesson
      setModules(prev => prev.map(m => ({
        ...m,
        lessons: m.lessons.map(l => 
          l.id === lessonId ? { ...l, completed: true } : l
        )
      })));
    } catch (err: any) {
      // Rollback on error
      setCompleted(false);
      setCourseProgress(previousProgress);
      console.error("Error marking lesson as viewed:", err);
      toast({
        title: "Error",
        description: err.message || "No se pudo marcar la lección como vista",
        variant: "destructive",
      });
    }
  }, [userId, lessonId, completed, courseProgress, modules, toast]);

  // Initial load
  useEffect(() => {
    if (userId && lessonId) {
      loadLesson();
    }
  }, [userId, lessonId, loadLesson]);

  return {
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
    error,
    handleComplete,
    refreshData: loadLesson,
  };
}
