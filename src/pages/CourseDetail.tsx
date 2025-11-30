import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Users, Award, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  lessons_count: number;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  start_date: string | null;
  end_date: string | null;
  modules: Module[];
  is_enrolled: boolean;
  progress: number;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourseDetail();
    }
  }, [id, user]);

  const loadCourseDetail = async () => {
    if (!id || !user) return;

    try {
      // Cargar datos del curso
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      // Verificar inscripción
      const { data: enrollmentData } = await supabase
        .from('user_courses')
        .select('progress')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle();

      // Cargar módulos del curso
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .eq('is_active', true)
        .order('module_number');

      if (modulesError) throw modulesError;

      // Contar lecciones por módulo
      const modulesWithLessons = await Promise.all(
        (modulesData || []).map(async (module) => {
          const { count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true })
            .eq('module_id', module.id)
            .eq('is_active', true);

          return {
            ...module,
            lessons_count: count || 0,
          };
        })
      );

      setCourse({
        ...courseData,
        modules: modulesWithLessons,
        is_enrolled: !!enrollmentData,
        progress: enrollmentData?.progress || 0,
      });
    } catch (error: any) {
      console.error('Error loading course detail:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el curso",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!id || !user) return;

    setEnrolling(true);
    try {
      const { error } = await supabase.rpc('enroll_in_course', {
        _course_id: id,
      });

      if (error) throw error;

      toast({
        title: "¡Inscripción exitosa!",
        description: "Ya puedes comenzar el curso",
      });

      loadCourseDetail();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la inscripción",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
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
          <p className="text-foreground font-medium">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Cursos
          </Button>
        </div>
      </nav>

      {/* Course Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="glass-card overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Course Image */}
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-24 w-24 text-primary/50" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-6">
              <div>
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                <h1 className="text-4xl font-bold mt-3 mb-4">{course.title}</h1>
                <p className="text-muted-foreground text-lg">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.modules.length} módulos</span>
                </div>
                {course.start_date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-5 w-5" />
                    <span>{new Date(course.start_date).getFullYear()}</span>
                  </div>
                )}
              </div>

              {course.is_enrolled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tu progreso</span>
                    <span className="text-sm font-semibold">{Math.round(course.progress)}%</span>
                  </div>
                  <Progress value={course.progress} className="h-3 progress-glow" />
                </div>
              )}

              <div className="flex gap-3">
                {course.is_enrolled ? (
                  <>
                    <Button
                      className="btn-gradient-primary flex-1"
                      size="lg"
                      onClick={() => navigate(`/dashboard?course=${course.id}`)}
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Ir al Curso
                    </Button>
                    <Badge className="flex items-center gap-2 px-4 bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="h-4 w-4" />
                      Inscrito
                    </Badge>
                  </>
                ) : (
                  <Button
                    className="btn-gradient-primary flex-1"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? "Inscribiendo..." : "Inscribirme Ahora"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Contenido del Curso</h2>
          
          {course.modules.map((module, idx) => (
            <Card
              key={module.id}
              className="p-6 border-border hover:border-primary/30 transition-all animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{module.module_number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                  <p className="text-muted-foreground mb-3">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{module.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{module.lessons_count} lecciones</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {course.modules.length === 0 && (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Este curso aún no tiene módulos disponibles</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
