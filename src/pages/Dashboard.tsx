import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, LogOut, User, CheckCircle2, PlayCircle, Award, Users, BookOpen } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { motion } from "framer-motion";

interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  unlocked: boolean;
}

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  lessons: Lesson[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [canDownloadCertificate, setCanDownloadCertificate] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'course'>('overview');
  const [courseTitle, setCourseTitle] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, courseId]);

  const loadDashboardData = async () => {
    try {
      // Check if user has admin role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      setIsAdmin(!!userRole);

      // If courseId is provided, show course-specific view
      if (courseId) {
        await loadCourseData(courseId);
        setViewMode('course');
      } else {
        setViewMode('overview');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el dashboard",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId: string) => {
    try {
      // Get course info
      const { data: courseData } = await supabase
        .from('courses')
        .select('title')
        .eq('id', courseId)
        .single();
      
      if (courseData) {
        setCourseTitle(courseData.title);
      }

      // Load modules for this course
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('module_number');

      if (modulesError) throw modulesError;

      // Load lessons for these modules
      const moduleIds = (modulesData || []).map(m => m.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds.length > 0 ? moduleIds : [''])
        .eq('is_active', true)
        .order('lesson_number');

      if (lessonsError) throw lessonsError;

      // Load user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (progressError) throw progressError;

      // Organize data
      const modulesWithLessons = (modulesData || []).map(module => {
        const moduleLessons = (lessonsData || []).filter(lesson => lesson.module_id === module.id);
        const lessonsWithProgress = moduleLessons.map((lesson) => {
          const progress = (progressData || []).find(p => p.lesson_id === lesson.id);
          const completed = progress?.completed || false;

          return {
            id: lesson.id,
            title: lesson.title,
            completed,
            unlocked: true,
          };
        });

        const completedCount = lessonsWithProgress.filter(l => l.completed).length;
        const progress = moduleLessons.length > 0 
          ? Math.round((completedCount / moduleLessons.length) * 100) 
          : 0;

        return {
          id: module.id,
          module_number: module.module_number,
          title: module.title,
          description: module.description || '',
          instructor: module.instructor || '',
          progress,
          lessons: lessonsWithProgress,
        };
      });

      setModules(modulesWithLessons);

      // Calculate total progress
      const totalLessons = (lessonsData || []).length;
      const lessonIds = (lessonsData || []).map(l => l.id);
      const completedLessons = (progressData || []).filter(
        p => p.completed && lessonIds.includes(p.lesson_id)
      ).length;
      const overallProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      setTotalProgress(overallProgress);

      // Check certificate eligibility
      if (totalLessons > 0 && completedLessons === totalLessons) {
        setCanDownloadCertificate(true);
      }
    } catch (error: any) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleLessonClick = (lesson: Lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Overview mode - show role-based dashboard
  if (viewMode === 'overview' && !courseId) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <DashboardNav 
          isAdmin={isAdmin} 
          canDownloadCertificate={canDownloadCertificate}
          onLogout={handleLogout}
        />

        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              {isAdmin ? 'Panel de Administración' : 'Mi Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? 'Gestiona cursos, usuarios y visualiza estadísticas'
                : 'Continúa tu aprendizaje donde lo dejaste'
              }
            </p>
          </motion.div>

          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <StudentDashboard userId={user!.id} />
          )}
        </div>

        <ChatBot />
      </div>
    );
  }

  // Course-specific view
  return (
    <div className="min-h-screen bg-gradient-dark">
      <DashboardNav 
        isAdmin={isAdmin} 
        canDownloadCertificate={canDownloadCertificate}
        onLogout={handleLogout}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        {courseTitle && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard/courses')}
              className="mb-2 -ml-2"
            >
              ← Volver a mis cursos
            </Button>
            <h1 className="text-3xl font-bold">{courseTitle}</h1>
          </motion.div>
        )}

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Mi Progreso</h2>
              <p className="text-muted-foreground">
                Has completado el {totalProgress}% del programa
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{totalProgress}%</div>
              <div className="text-sm text-muted-foreground">Completado</div>
            </div>
          </div>
          <Progress value={totalProgress} className="h-3 progress-glow" />
        </motion.div>

        {/* Modules */}
        <div className="space-y-6">
          {modules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
                  <p className="text-muted-foreground mb-1">{module.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Docente: {module.instructor}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {module.progress}%
                  </div>
                </div>
              </div>
              <Progress value={module.progress} className="mb-4" />

              {/* Lessons */}
              <div className="grid md:grid-cols-3 gap-4">
                {module.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className="p-4 rounded-lg border text-left transition-all border-border hover:border-primary bg-card hover:bg-card-hover cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{lesson.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {lesson.completed ? "Completado" : "Disponible"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ))}

          {modules.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay módulos disponibles</h3>
              <p className="text-muted-foreground">
                Este curso aún no tiene contenido
              </p>
            </div>
          )}
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Dashboard;
