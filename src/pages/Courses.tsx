import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, LogOut, User, BookOpen, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const Courses = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      // Cargar cursos activos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Cargar inscripciones del usuario
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      const enrolledCourseIds = new Set(enrollmentsData?.map(e => e.course_id) || []);

      // Contar módulos por curso
      const coursesWithData = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_active', true);

          return {
            ...course,
            is_enrolled: enrolledCourseIds.has(course.id),
            modules_count: count || 0,
          };
        })
      );

      setCourses(coursesWithData);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
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
    switch (level.toLowerCase()) {
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
          <p className="text-foreground font-medium">Cargando cursos...</p>
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
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Mis Cursos
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
          <h1 className="text-4xl font-bold mb-3">Catálogo de Cursos</h1>
          <p className="text-muted-foreground text-lg">
            Explora y matricúlate en nuestros programas educativos
          </p>
        </div>

        {/* Courses Grid */}
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
                {course.is_enrolled && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-success text-white border-0">
                      Inscrito
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
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules_count} módulos</span>
                  </div>
                  {course.start_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(course.start_date).getFullYear()}</span>
                    </div>
                  )}
                </div>

                <Button
                  className={
                    course.is_enrolled
                      ? "w-full btn-gradient-primary"
                      : "w-full"
                  }
                  variant={course.is_enrolled ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course.id}`);
                  }}
                >
                  {course.is_enrolled ? (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Continuar Curso
                    </>
                  ) : (
                    "Ver Detalles"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay cursos disponibles</h3>
            <p className="text-muted-foreground">
              Pronto habrá nuevos cursos disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
