import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

const Exam = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState<string>("");

  useEffect(() => {
    loadExam();
  }, [lessonId]);

  const loadExam = async () => {
    if (!lessonId) return;

    try {
      // Obtener el examen asociado a la lección
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (examError) throw examError;
      
      if (!exam) {
        toast({
          title: "Error",
          description: "No hay examen disponible para esta lección",
          variant: "destructive",
        });
        navigate(`/lesson/${lessonId}`);
        return;
      }
      setExamId(exam.id);

      // Obtener las preguntas del examen
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', exam.id);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

    } catch (error: any) {
      console.error('Error loading exam:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el examen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOptionKey = (option: string): string => {
    const map: Record<string, string> = {
      'A': 'option_a',
      'B': 'option_b',
      'C': 'option_c',
      'D': 'option_d'
    };
    return map[option] || '';
  };

  const handleSubmit = async () => {
    if (!user || !examId || !lessonId) return;

    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer && getOptionKey(q.correct_answer) === userAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setScore(percentage);
    const passed = percentage >= 80;

    try {
      // Llamar a la función RPC para registrar el intento
      const answersData = questions.reduce((acc, q) => {
        acc[q.id] = answers[q.id] || '';
        return acc;
      }, {} as Record<string, string>);

      const { data, error } = await supabase.rpc('submit_exam_attempt', {
        _exam_id: examId,
        _lesson_id: lessonId,
        _answers: answersData,
        _score: percentage,
        _passed: passed
      });

      if (error) throw error;

      setSubmitted(true);

      if (passed) {
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

    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el examen",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando examen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/lesson/${lessonId}`)}
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
              {questions.map((question, idx) => (
                <div key={question.id} className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {idx + 1}. {question.question_text}
                  </h3>
                  <RadioGroup
                    value={answers[question.id]}
                    onValueChange={(value) =>
                      setAnswers({ ...answers, [question.id]: value })
                    }
                  >
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey, optIdx) => (
                      <div
                        key={optKey}
                        className="flex items-center space-x-2 p-3 rounded-lg hover:bg-card transition-colors"
                      >
                        <RadioGroupItem
                          value={optKey}
                          id={`q${question.id}-${optKey}`}
                        />
                        <Label
                          htmlFor={`q${question.id}-${optKey}`}
                          className="flex-1 cursor-pointer"
                        >
                          {question[optKey as keyof Question]}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
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
                {questions.map((question, idx) => {
                  const userAnswer = answers[question.id];
                  const correctKey = getOptionKey(question.correct_answer);
                  const isCorrect = userAnswer === correctKey;
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
                            {idx + 1}. {question.question_text}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tu respuesta:{" "}
                            <span
                              className={
                                isCorrect ? "text-success" : "text-destructive"
                              }
                            >
                              {userAnswer ? question[userAnswer as keyof Question] : 'No respondida'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-success mt-1">
                              Respuesta correcta:{" "}
                              {question[correctKey as keyof Question]}
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
                      onClick={() => navigate(`/lesson/${lessonId}`)}
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