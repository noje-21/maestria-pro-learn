import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const mockQuestions = [
  {
    id: 1,
    question: "¿Cuál es el concepto fundamental más importante de este módulo?",
    options: [
      "La teoría básica",
      "La aplicación práctica",
      "Los fundamentos esenciales",
      "El contexto histórico",
    ],
    correct: 2,
  },
  {
    id: 2,
    question: "¿Qué metodología se recomienda aplicar primero?",
    options: [
      "Análisis detallado",
      "Implementación directa",
      "Planificación estratégica",
      "Evaluación continua",
    ],
    correct: 0,
  },
  {
    id: 3,
    question: "¿Cuál es el principal beneficio de esta técnica?",
    options: [
      "Mayor eficiencia",
      "Menor costo",
      "Mejor calidad",
      "Todas las anteriores",
    ],
    correct: 3,
  },
  {
    id: 4,
    question: "¿En qué situación NO se recomienda usar este enfoque?",
    options: [
      "Proyectos complejos",
      "Equipos pequeños",
      "Problemas simples",
      "Recursos limitados",
    ],
    correct: 2,
  },
  {
    id: 5,
    question: "¿Qué factor es crítico para el éxito de la implementación?",
    options: [
      "Comunicación efectiva",
      "Presupuesto adecuado",
      "Tecnología avanzada",
      "Experiencia previa",
    ],
    correct: 0,
  },
];

const Exam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    mockQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });

    const percentage = (correct / mockQuestions.length) * 100;
    setScore(percentage);
    setSubmitted(true);

    if (percentage >= 80) {
      toast({
        title: "¡Excelente trabajo!",
        description: `Has aprobado con ${percentage}%. La siguiente clase está desbloqueada.`,
      });
    } else {
      toast({
        title: "Necesitas mejorar",
        description: `Has obtenido ${percentage}%. Necesitas 80% para aprobar.`,
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/lesson/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Clase
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="glass-card p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Examen del Módulo</h1>
            <p className="text-muted-foreground">
              Necesitas 80% o más para aprobar y desbloquear la siguiente clase
            </p>
          </div>

          {!submitted ? (
            <div className="space-y-8">
              {mockQuestions.map((question, idx) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {idx + 1}. {question.question}
                  </h3>
                  <RadioGroup
                    value={answers[question.id]?.toString()}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [question.id]: parseInt(value) })
                    }
                  >
                    {question.options.map((option, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-card transition-colors"
                      >
                        <RadioGroupItem
                          value={optIdx.toString()}
                          id={`q${question.id}-opt${optIdx}`}
                        />
                        <Label
                          htmlFor={`q${question.id}-opt${optIdx}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== mockQuestions.length}
                className="w-full btn-gradient-primary"
                size="lg"
              >
                Enviar Respuestas
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  score >= 80
                    ? "bg-success/10 border-success"
                    : "bg-destructive/10 border-destructive"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {score >= 80 ? (
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {score >= 80 ? "¡Aprobado!" : "No Aprobado"}
                    </h2>
                    <p className="text-muted-foreground">
                      Tu puntuación: {score}%
                    </p>
                  </div>
                </div>
                <p>
                  {score >= 80
                    ? "¡Felicitaciones! Has completado exitosamente el examen. La siguiente clase está ahora disponible."
                    : "No alcanzaste el 80% requerido. Te recomendamos revisar el material de nuevo antes de reintentar."}
                </p>
              </div>

              {/* Answer Review */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold">Revisión de Respuestas</h3>
                {mockQuestions.map((question, idx) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correct;
                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border ${
                        isCorrect
                          ? "bg-success/5 border-success/30"
                          : "bg-destructive/5 border-destructive/30"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold mb-2">
                            {idx + 1}. {question.question}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tu respuesta:{" "}
                            <span
                              className={
                                isCorrect ? "text-success" : "text-destructive"
                              }
                            >
                              {question.options[userAnswer]}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-success mt-1">
                              Respuesta correcta:{" "}
                              {question.options[question.correct]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {score >= 80 ? (
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 btn-gradient-primary"
                    size="lg"
                  >
                    Continuar al Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      Reintentar Examen
                    </Button>
                    <Button
                      onClick={() => navigate(`/lesson/${id}`)}
                      className="flex-1 btn-gradient-primary"
                      size="lg"
                    >
                      Revisar Material
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Exam;
