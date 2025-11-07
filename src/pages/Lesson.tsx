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
  duration_minutes?: number;
}

interface Video {
  id: string;
  video_url: string;
  title: string | null;
  order_number: number;
}

interface Material {
  id: string;
  title: string;
  file_url: string;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (user && id) {
      loadLesson();
    }
  }, [user, id]);

  const loadLesson = async () => {
    if (!id) return;
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) {
        toast({
          title: "Error",
          description: "Lección no encontrada",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setLesson(lessonData);

      // Load videos
      const { data: videosData, error: videosError } = await supabase
        .from("lesson_videos")
        .select("*")
        .eq("lesson_id", id)
        .order("order_number");

      if (videosError) throw videosError;
      setVideos(videosData || []);

      // Load materials
      const { data: materialsData, error: materialsError } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", id)
        .order("created_at");

      if (materialsError) throw materialsError;
      setMaterials(materialsData || []);

      // Load progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", user!.id)
        .eq("lesson_id", id)
        .maybeSingle();

      setCompleted(progressData?.completed || false);
    } catch (error: any) {
      console.error("Error loading lesson:", error);
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
      // Use secure RPC function to mark lesson as viewed
      const { data, error } = await supabase.rpc("mark_lesson_viewed", {
        _lesson_id: id,
      });

      if (error) throw error;

      setCompleted(true);
      toast({
        title: "¡Lección vista!",
        description:
          "Ahora realiza el examen para completar esta lección.",
      });
    } catch (error: any) {
      console.error("Error marking lesson as viewed:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar la lección como vista",
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

  if (!lesson) return null;

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
          <p className="text-muted-foreground text-lg">
            {lesson.description ||
              "Aprende los conceptos fundamentales de este módulo"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Videos */}
            {videos.length === 0 ? (
              <div className="glass-card p-6">
                <p className="text-center text-muted-foreground">
                  No hay videos disponibles para esta lección
                </p>
              </div>
            ) : (
              videos.map((video, index) => (
                <div key={video.id} className="glass-card p-6">
                  <div className="aspect-video bg-background rounded-lg overflow-hidden mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={video.video_url}
                      title={video.title || `Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {video.title || `Video ${index + 1}`}
                  </h3>
                </div>
              ))
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-between">
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

            {/* Descripción */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">
                Descripción del Módulo
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Esta clase te proporcionará las bases fundamentales necesarias
                para comprender los conceptos más avanzados de los siguientes
                módulos.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Materiales */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Materiales</h3>
              {materials.length === 0 ? (
                <div className="p-4 bg-muted/20 rounded-lg border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    No hay materiales disponibles para esta lección
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <a
                      key={material.id}
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-card-hover transition-colors border border-border"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {material.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Descargar
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Progreso */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Tu Progreso</h3>
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
            </div>
          </div>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Lesson;
