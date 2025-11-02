import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, LogOut, User, Lock, CheckCircle2, PlayCircle, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProgress, setTotalProgress] = useState(0);
  const [canDownloadCertificate, setCanDownloadCertificate] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Cargar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('module_number');

      if (modulesError) throw modulesError;

      // Cargar lecciones
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .order('lesson_number');

      if (lessonsError) throw lessonsError;

      // Cargar progreso del usuario
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (progressError) throw progressError;

      // Organizar datos
      const modulesWithLessons = modulesData!.map((module) => {
        const moduleLessons = lessonsData!.filter(
          (lesson) => lesson.module_id === module.id
        );

        const lessonsWithProgress = moduleLessons.map((lesson, index) => {
          const progress = progressData!.find((p) => p.lesson_id === lesson.id);
          const completed = progress?.completed || false;
          
          // La primera lección siempre está desbloqueada
          const unlocked = index === 0 || (moduleLessons[index - 1] && 
            progressData!.find((p) => p.lesson_id === moduleLessons[index - 1].id)?.completed);

          return {
            id: lesson.id,
            title: lesson.title,
            completed,
            unlocked: unlocked || false,
          };
        });

        const completedCount = lessonsWithProgress.filter((l) => l.completed).length;
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

      // Calcular progreso total
      const totalLessons = lessonsData!.length;
      const completedLessons = progressData!.filter((p) => p.completed).length;
      const overallProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      setTotalProgress(overallProgress);

      // Verificar si puede descargar certificado
      if (totalLessons > 0 && completedLessons === totalLessons) {
        setCanDownloadCertificate(true);
      }

    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.unlocked) {
      navigate(`/lesson/${lesson.id}`);
    } else {
      toast({
        title: "Lección bloqueada",
        description: "Completa la lección anterior para desbloquear esta",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
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
            <span className="text-2xl font-bold gradient-text">MaestríaPro</span>
          </div>
          <div className="flex items-center gap-2">
            {canDownloadCertificate && (
              <Button
                variant="outline"
                onClick={() => navigate("/certificate")}
                className="gap-2"
              >
                <Award className="h-5 w-5" />
                Certificado
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mi Progreso</h1>
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
        </div>

        {/* Modules */}
        <div className="space-y-6">
          {modules.map((module, idx) => (
            <div
              key={module.id}
              className="glass-card p-6 animate-slide-up"
              style={{ animationDelay: `${idx * 0.05}s` }}
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
                {module.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    disabled={!lesson.unlocked}
                    className={`
                      p-4 rounded-lg border text-left transition-all
                      ${
                        lesson.unlocked
                          ? "border-border hover:border-primary bg-card hover:bg-card-hover cursor-pointer"
                          : "border-border/50 bg-muted/20 cursor-not-allowed opacity-50"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : lesson.unlocked ? (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{lesson.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {lesson.completed
                            ? "Completado"
                            : lesson.unlocked
                            ? "Disponible"
                            : "Bloqueado"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Dashboard;