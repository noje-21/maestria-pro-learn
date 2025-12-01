import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  LogOut, 
  User, 
  BookOpen, 
  Clock, 
  Award,
  Users,
  ArrowRight,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
            level
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
            description: course.description,
            image_url: course.image_url,
            level: course.level || 'maestría',
            progress: progressData || enrollment.progress || 0,
            status: enrollment.status,
            modules_count: count || 0,
            enrolled_at: enrollment.enrolled_at,
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

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medio':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'avanzado':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'maestría':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
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
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">MCP</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => navigate("/admin")} className="btn-gradient-primary gap-2">
                <Users className="h-4 w-4" />
                Panel Admin
              </Button>
            )}
            <Button onClick={() => navigate("/courses")} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Explorar Cursos
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Mis Cursos</h1>
          <p className="text-muted-foreground text-lg">
            Continúa tu aprendizaje donde lo dejaste
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => (
              <Card
                key={course.id}
                className="group cursor-pointer overflow-hidden border-border hover:border-primary/50 transition-all animate-slide-up hover:shadow-glow"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {/* Course Image */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  {course.progress >= 100 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-success text-white border-0">
                        <Award className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-semibold text-primary">{Math.round(course.progress)}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.modules_count} módulos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(course.enrolled_at).toLocaleDateString('es-ES', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full btn-gradient-primary group-hover:shadow-glow transition-shadow"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.id}`);
                    }}
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No estás inscrito en ningún curso</h3>
            <p className="text-muted-foreground mb-6">
              Explora nuestro catálogo y comienza tu aprendizaje
            </p>
            <Button onClick={() => navigate("/courses")} className="btn-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Explorar Cursos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
