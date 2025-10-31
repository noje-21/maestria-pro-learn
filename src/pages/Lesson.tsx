import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CheckCircle2, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);

  // Datos de demostración
  const lesson = {
    id: parseInt(id || "1"),
    title: "Introducción a los Conceptos Fundamentales",
    description: "En esta lección aprenderás los fundamentos esenciales del curso",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    materials: [
      { name: "Presentación PDF", size: "2.5 MB", url: "#" },
      { name: "Material Complementario", size: "1.2 MB", url: "#" },
      { name: "Ejercicios Prácticos", size: "850 KB", url: "#" },
    ],
  };

  const handleComplete = () => {
    setCompleted(true);
    toast({
      title: "¡Clase completada!",
      description: "Ahora puedes realizar el examen para desbloquear la siguiente clase.",
    });
  };

  const handleExam = () => {
    navigate(`/exam/${lesson.id}`);
  };

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
          <p className="text-muted-foreground text-lg">{lesson.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video */}
            <div className="glass-card p-6">
              <div className="aspect-video bg-background rounded-lg overflow-hidden mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={lesson.videoUrl}
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Video de la Clase</h3>
                  <p className="text-sm text-muted-foreground">
                    Duración: 45 minutos
                  </p>
                </div>
                {!completed && (
                  <Button
                    onClick={handleComplete}
                    className="btn-gradient-primary gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar como Completada
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
              <div className="space-y-3">
                {lesson.materials.map((material, idx) => (
                  <a
                    key={idx}
                    href={material.url}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-card-hover transition-colors border border-border"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {material.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {material.size}
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
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
                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-sm text-success">
                      ¡Excelente trabajo! Ahora realiza el examen para
                      desbloquear la siguiente clase.
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
