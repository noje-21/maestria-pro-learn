import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CheckCircle2, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LessonData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  material_url?: string;
  duration_minutes?: number;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonData | null>(null);

  useEffect(() => {
    if (user && id) {
      loadLesson();
    }
  }, [user, id]);

  const loadLesson = async () => {
    if (!id) return;

    try {
      // Load lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        toast({
          title: "Error",
          description: "Lección no encontrada",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setLesson(lessonData);

      // Check if already completed
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('completed')
        .eq('user_id', user!.id)
        .eq('lesson_id', id)
        .maybeSingle();

      setCompleted(progressData?.completed || false);
    } catch (error: any) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lección",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user || !id || completed) return;

    try {
      // Mark lesson as complete - but don't unlock next lesson yet
      // Next lesson unlocks only after passing the exam
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          lesson_id: id,
          completed: false, // Will be set to true after passing exam
          completed_at: null,
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      setCompleted(true);
      toast({
        title: "¡Lección vista!",
        description: "Ahora realiza el examen para completar esta lección y desbloquear la siguiente.",
      });
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la lección como vista",
        variant: "destructive",
      });
    }
  };

  const handleExam = () => {
    if (!lesson) return;
    navigate(`/exam/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="glass-card p-8 mb-6">
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-muted-foreground text-lg">{lesson.description || 'Aprende los conceptos fundamentales de este módulo'}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            <div className="glass-card p-6">
              <div className="aspect-video bg-background rounded-lg overflow-hidden mb-4">
                {lesson.video_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={lesson.video_url}
                    title="Lesson Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/20">
                    <p className="text-muted-foreground">Video no disponible</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Video de la Clase</h3>
                  <p className="text-sm text-muted-foreground">
                    Duración: {lesson.duration_minutes || 45} minutos
                  </p>
                </div>
                {!completed && (
                  <Button
                    onClick={handleComplete}
                    className="btn-gradient-primary gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar como Vista
                  </Button>
                )}
                {completed && (
                  <Button
                    onClick={handleExam}
                    className="btn-gradient-secondary gap-2"
                  >
                    Realizar Examen
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Descripción del Módulo</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Esta clase introductoria te proporcionará las bases fundamentales
                  necesarias para comprender los conceptos más avanzados que veremos
                  en módulos posteriores. Aprenderás sobre los principios básicos,
                  las mejores prácticas y cómo aplicar estos conocimientos en
                  situaciones del mundo real.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Al finalizar esta lección, serás capaz de identificar los
                  conceptos clave y estarás preparado para profundizar en temas
                  más complejos. Recuerda revisar los materiales complementarios
                  disponibles en la sección lateral.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Materials */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Materiales</h3>
              {lesson.material_url ? (
                <a
                  href={lesson.material_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-card-hover transition-colors border border-border"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      Material de la Clase
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Descargar PDF
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay materiales disponibles para esta lección
                  </p>
                </div>
              )}
            </div>

            {/* Progress Card */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Tu Progreso</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Estado de la clase
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      completed ? "text-success" : "text-primary"
                    }`}
                  >
                    {completed ? "Completada" : "En Progreso"}
                  </span>
                </div>
                {completed && (
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-sm text-primary">
                      ¡Listo! Ahora realiza el examen para completar esta lección y desbloquear la siguiente.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Lesson;
