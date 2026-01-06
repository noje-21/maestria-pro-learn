import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  id: string;
  lesson_number: number;
  title: string;
  duration_minutes: number;
  completed: boolean;
  locked?: boolean;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons: Lesson[];
}

interface CourseHubData {
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    level: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  modules: Module[];
  stats: {
    totalModules: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  instructors: string[];
  lastLessonId: string | null;
  lastLessonTitle: string | null;
  isEnrolled: boolean;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useCourseHub(courseId: string | undefined, userId: string | undefined): CourseHubData {
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseHubData['course']>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [lastCompletedLessonId, setLastCompletedLessonId] = useState<string | null>(null);

  const loadCourseData = useCallback(async () => {
    if (!courseId || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch course, enrollment, modules, lessons, and progress in parallel
      const [courseResult, enrollmentResult, modulesResult] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single(),
        supabase
          .from('user_courses')
          .select('*')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle(),
        supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_active', true)
          .order('module_number')
      ]);

      if (courseResult.error) throw courseResult.error;
      if (modulesResult.error) throw modulesResult.error;

      setCourse(courseResult.data);
      setIsEnrolled(!!enrollmentResult.data);

      // Fetch lessons for all modules
      const moduleIds = (modulesResult.data || []).map(m => m.id);
      
      if (moduleIds.length === 0) {
        setModules([]);
        setLoading(false);
        return;
      }

      const [lessonsResult, progressResult] = await Promise.all([
        supabase
          .from('lessons')
          .select('*')
          .in('module_id', moduleIds)
          .eq('is_active', true)
          .order('lesson_number'),
        supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true)
      ]);

      if (lessonsResult.error) throw lessonsResult.error;

      // Create progress map
      const progressMap = new Map(
        (progressResult.data || []).map(p => [p.lesson_id, p])
      );
      
      setCompletedLessonIds(new Set(progressMap.keys()));

      // Find last completed lesson
      const sortedProgress = (progressResult.data || [])
        .filter(p => p.completed_at)
        .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());
      
      if (sortedProgress.length > 0) {
        setLastCompletedLessonId(sortedProgress[0].lesson_id);
      }

      // Build modules with lessons
      const modulesWithLessons: Module[] = (modulesResult.data || []).map(module => {
        const moduleLessons = (lessonsResult.data || [])
          .filter(lesson => lesson.module_id === module.id)
          .map(lesson => ({
            id: lesson.id,
            lesson_number: lesson.lesson_number,
            title: lesson.title,
            duration_minutes: lesson.duration_minutes || 0,
            completed: progressMap.has(lesson.id),
            locked: false, // Could implement locking logic here
          }));

        return {
          id: module.id,
          module_number: module.module_number,
          title: module.title,
          description: module.description || '',
          instructor: module.instructor || '',
          lessons: moduleLessons,
        };
      });

      setModules(modulesWithLessons);
    } catch (err: any) {
      console.error('Error loading course data:', err);
      setError(err.message || 'No se pudo cargar el curso');
      toast({
        title: "Error",
        description: "No se pudo cargar los datos del curso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, userId, toast]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  // Compute stats
  const stats = useMemo(() => {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = modules.reduce(
      (acc, m) => acc + m.lessons.filter(l => l.completed).length, 
      0
    );
    const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalModules: modules.length,
      totalLessons,
      completedLessons,
      progress,
    };
  }, [modules]);

  // Extract unique instructors
  const instructors = useMemo(() => {
    const instructorSet = new Set<string>();
    modules.forEach(m => {
      if (m.instructor) instructorSet.add(m.instructor);
    });
    return Array.from(instructorSet);
  }, [modules]);

  // Find last lesson title
  const lastLessonTitle = useMemo(() => {
    if (!lastCompletedLessonId) return null;
    for (const module of modules) {
      const lesson = module.lessons.find(l => l.id === lastCompletedLessonId);
      if (lesson) return lesson.title;
    }
    return null;
  }, [modules, lastCompletedLessonId]);

  // Find first incomplete lesson or first lesson
  const getNextLessonId = useCallback(() => {
    for (const module of modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed && !lesson.locked) {
          return lesson.id;
        }
      }
    }
    // If all completed, return first lesson
    if (modules.length > 0 && modules[0].lessons.length > 0) {
      return modules[0].lessons[0].id;
    }
    return null;
  }, [modules]);

  return {
    course,
    modules,
    stats,
    instructors,
    lastLessonId: getNextLessonId(),
    lastLessonTitle,
    isEnrolled,
    loading,
    error,
    refreshData: loadCourseData,
  };
}
