import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_enrolled: boolean;
  modules_count: number;
  progress?: number;
}

interface UseCourseDataResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;
}

export function useCourseData(userId: string | undefined): UseCourseDataResult {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch courses and enrollments in parallel
      const [coursesResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .eq('status', 'active'),
        supabase
          .from('user_courses')
          .select('course_id, progress')
          .eq('user_id', userId)
          .eq('status', 'enrolled')
      ]);

      if (coursesResult.error) throw coursesResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;

      const enrollmentMap = new Map(
        (enrollmentsResult.data || []).map(e => [e.course_id, e.progress || 0])
      );

      // Get module counts for all courses in a single query
      const courseIds = (coursesResult.data || []).map(c => c.id);
      const { data: moduleCounts } = await supabase
        .from('modules')
        .select('course_id')
        .in('course_id', courseIds)
        .eq('is_active', true);

      const moduleCountMap = new Map<string, number>();
      (moduleCounts || []).forEach(m => {
        moduleCountMap.set(m.course_id, (moduleCountMap.get(m.course_id) || 0) + 1);
      });

      const coursesWithData = (coursesResult.data || []).map(course => ({
        ...course,
        is_enrolled: enrollmentMap.has(course.id),
        modules_count: moduleCountMap.get(course.id) || 0,
        progress: enrollmentMap.has(course.id) ? enrollmentMap.get(course.id) : undefined,
      }));

      setCourses(coursesWithData);
    } catch (err: any) {
      console.error('Error loading courses:', err);
      setError(err.message || 'No se pudieron cargar los cursos');
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      loadCourses();
    }
  }, [userId, loadCourses]);

  return {
    courses,
    loading,
    error,
    refreshCourses: loadCourses,
  };
}
