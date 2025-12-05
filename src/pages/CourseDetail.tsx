import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle2,
  Play,
  Layers,
  GraduationCap,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CourseRecommendations } from "@/components/courses/CourseRecommendations";
import { motion } from "framer-motion";

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
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;

      const { data: enrollmentData } = await supabase
        .from('user_courses')
        .select('progress')
        .eq('user_id', user.id)
        .eq('course_id', id)
        .maybeSingle();

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', id)
        .eq('is_active', true)
        .order('module_number');

      if (modulesError) throw modulesError;

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

  const getLevelConfig = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🌱' };
      case 'medio':
        return { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30', icon: '📚' };
      case 'avanzado':
        return { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30', icon: '🚀' };
      case 'maestría':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: '👑' };
      default:
        return { bg: 'bg-muted/20', text: 'text-muted-foreground', border: 'border-muted/30', icon: '📖' };
    }
  };

  const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons_count, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
          <p className="text-foreground font-medium">Cargando curso...</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const levelConfig = getLevelConfig(course.level);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Cursos
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0 h-[500px]">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className={`${levelConfig.bg} ${levelConfig.text} ${levelConfig.border} border text-sm font-medium px-3 py-1 mb-4`}>
                <span className="mr-1.5">{levelConfig.icon}</span>
                {course.level}
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              {course.title}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl"
            >
              {course.description}
            </motion.p>

            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{course.modules.length}</p>
                    <p className="text-xs text-muted-foreground">Módulos</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalLessons}</p>
                    <p className="text-xs text-muted-foreground">Lecciones</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <GraduationCap className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold capitalize">{course.level}</p>
                    <p className="text-xs text-muted-foreground">Nivel</p>
                  </div>
                </div>
              </Card>
              
              {course.start_date && (
                <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{new Date(course.start_date).getFullYear()}</p>
                      <p className="text-xs text-muted-foreground">Año</p>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>

            {/* Progress (if enrolled) */}
            {course.is_enrolled && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <span className="font-medium">Tu progreso</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">{Math.round(course.progress)}%</span>
                  </div>
                  <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              {course.is_enrolled ? (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 px-8 h-14 text-lg font-semibold"
                    onClick={() => navigate(`/dashboard?course=${course.id}`)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continuar Aprendiendo
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Badge className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Ya estás inscrito
                  </Badge>
                </>
              ) : (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg shadow-primary/25 px-8 h-14 text-lg font-semibold"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent mr-2" />
                      Inscribiendo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Inscribirme Ahora
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-primary/20">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          Contenido del Curso
        </motion.h2>
        
        {/* Timeline Modules */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
          
          <div className="space-y-6">
            {course.modules.map((module, idx) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-16 md:pl-20"
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-6 w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 z-10">
                  <span className="text-xl md:text-2xl font-bold text-primary-foreground">{module.module_number}</span>
                </div>
                
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {module.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {module.instructor && (
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-primary/70" />
                            <span>{module.instructor}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4 text-primary/70" />
                          <span>{module.lessons_count} lecciones</span>
                        </div>
                      </div>
                    </div>
                    
                    {course.is_enrolled && (
                      <Button 
                        variant="outline" 
                        className="border-primary/50 text-primary hover:bg-primary/10 shrink-0"
                        onClick={() => navigate(`/dashboard?course=${course.id}&module=${module.id}`)}
                      >
                        Ver módulo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {course.modules.length === 0 && (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Este curso aún no tiene módulos disponibles</p>
            </Card>
          )}
        </div>
      </section>

      {/* Recommendations */}
      {user && (
        <section className="container mx-auto px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-8 border-t border-border/30"
          >
            <CourseRecommendations userId={user.id} currentCourseId={course.id} limit={4} />
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default CourseDetail;
