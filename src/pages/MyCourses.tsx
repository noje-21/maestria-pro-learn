import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  LogOut, 
  User, 
  BookOpen, 
  Users,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { motion } from "framer-motion";

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  progress: number;
  status: string;
  modules_count: number;
  enrolled_at: string;
  start_date: string | null;
}

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyCourses();
      checkAdminRole();
    }
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const loadMyCourses = async () => {
    if (!user) return;

    try {
      // Cargar inscripciones del usuario con datos del curso
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          progress,
          status,
          enrolled_at,
          courses (
            id,
            title,
            description,
            image_url,
            level,
            start_date
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'enrolled');

      if (enrollmentsError) throw enrollmentsError;

      // Procesar datos y contar módulos
      const coursesWithData = await Promise.all(
        (enrollments || []).map(async (enrollment: any) => {
          const course = enrollment.courses;
          if (!course) return null;

          const { count } = await supabase
            .from('modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_active', true);

          // Calcular progreso real
          const { data: progressData } = await supabase.rpc(
            'calculate_course_progress',
            { _user_id: user.id, _course_id: course.id }
          );

          return {
            id: course.id,
            title: course.title,
            description: course.description || '',
            image_url: course.image_url,
            level: course.level || 'maestría',
            progress: progressData || enrollment.progress || 0,
            status: enrollment.status,
            modules_count: count || 0,
            enrolled_at: enrollment.enrolled_at,
            start_date: course.start_date,
            is_enrolled: true,
          };
        })
      );

      setCourses(coursesWithData.filter(Boolean) as EnrolledCourse[]);
    } catch (error: any) {
      console.error('Error loading my courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando tus cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MCP</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => navigate("/admin")} className="btn-gradient-primary gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Panel Admin</span>
              </Button>
            )}
            <Button onClick={() => navigate("/courses")} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Explorar Cursos</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">Mis Cursos</h1>
          <p className="text-muted-foreground text-lg">
            Continúa tu aprendizaje donde lo dejaste
          </p>
        </motion.div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <CourseCard
                key={course.id}
                course={{
                  ...course,
                  is_enrolled: true,
                }}
                index={idx}
                onClick={() => navigate(`/course/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No estás inscrito en ningún curso</h3>
            <p className="text-muted-foreground mb-6">
              Explora nuestro catálogo y comienza tu aprendizaje
            </p>
            <Button onClick={() => navigate("/courses")} className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Explorar Cursos
            </Button>
          </motion.div>
        )}

        {/* Recommendations */}
        {user && (
          <div className="pt-8 border-t border-border">
            <CourseRecommendations userId={user.id} limit={4} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
