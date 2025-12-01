import { supabase } from "@/integrations/supabase/client";

export interface UserEnrollment {
  course_id: string;
  status: string;
}

/**
 * Obtiene las inscripciones del usuario
 */
export const getUserEnrollments = async (userId: string): Promise<UserEnrollment[]> => {
  const { data, error } = await supabase
    .from('user_courses')
    .select('course_id, status')
    .eq('user_id', userId)
    .eq('status', 'enrolled');

  if (error) {
    console.error('Error fetching user enrollments:', error);
    return [];
  }

  return data || [];
};

/**
 * Determina la ruta de redirección basada en las inscripciones del usuario
 * - Sin cursos → /courses (catálogo)
 * - 1 curso → /course/:id (detalle del curso)
 * - Múltiples cursos → /dashboard/courses (mis cursos)
 */
export const getSmartRedirectPath = async (userId: string): Promise<string> => {
  try {
    const enrollments = await getUserEnrollments(userId);

    if (enrollments.length === 0) {
      return '/courses';
    }

    if (enrollments.length === 1) {
      return `/course/${enrollments[0].course_id}`;
    }

    return '/dashboard/courses';
  } catch (error) {
    console.error('Error determining redirect path:', error);
    return '/courses';
  }
};

/**
 * Hook helper para usar en componentes
 */
export const handleLoginRedirect = async (
  userId: string,
  navigate: (path: string) => void
): Promise<void> => {
  const redirectPath = await getSmartRedirectPath(userId);
  navigate(redirectPath);
};
