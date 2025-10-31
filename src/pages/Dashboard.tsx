import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, LogOut, User, Lock, CheckCircle2, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatBot from "@/components/ChatBot";

// Datos de demostración
const mockModules = [
  {
    id: 1,
    title: "Módulo 1: Fundamentos",
    description: "Conceptos básicos y fundamentos esenciales",
    progress: 100,
    lessons: [
      { id: 1, title: "Introducción", completed: true, unlocked: true },
      { id: 2, title: "Conceptos Clave", completed: true, unlocked: true },
      { id: 3, title: "Aplicaciones Prácticas", completed: true, unlocked: true },
    ],
  },
  {
    id: 2,
    title: "Módulo 2: Nivel Intermedio",
    description: "Profundización en técnicas y metodologías",
    progress: 33,
    lessons: [
      { id: 4, title: "Técnicas Avanzadas", completed: true, unlocked: true },
      { id: 5, title: "Casos de Estudio", completed: false, unlocked: true },
      { id: 6, title: "Proyecto Práctico", completed: false, unlocked: false },
    ],
  },
  {
    id: 3,
    title: "Módulo 3: Nivel Avanzado",
    description: "Dominando conceptos complejos",
    progress: 0,
    lessons: [
      { id: 7, title: "Estrategias Profesionales", completed: false, unlocked: false },
      { id: 8, title: "Análisis Profundo", completed: false, unlocked: false },
      { id: 9, title: "Certificación Final", completed: false, unlocked: false },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [modules] = useState(mockModules);
  
  const totalProgress = Math.round(
    modules.reduce((acc, mod) => acc + mod.progress, 0) / modules.length
  );

  const handleLogout = () => {
    navigate("/");
  };

  const handleLessonClick = (lesson: any) => {
    if (lesson.unlocked) {
      navigate(`/lesson/${lesson.id}`);
    }
  };

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
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{module.title}</h2>
                  <p className="text-muted-foreground">{module.description}</p>
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
