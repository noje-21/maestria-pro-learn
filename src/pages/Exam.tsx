import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { examAnswerSchema } from "@/lib/validations";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  hint: string | null;
}

interface ShuffledOption {
  key: string;
  text: string;
  letter: string;
}

const Exam = () => {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, ShuffledOption[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

  // Función para aleatorizar arrays
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Función para crear opciones mezcladas
  const createShuffledOptions = (question: Question): ShuffledOption[] => {
    const options = [
      { key: 'option_a', text: question.option_a, letter: 'A' },
      { key: 'option_b', text: question.option_b, letter: 'B' },
      { key: 'option_c', text: question.option_c, letter: 'C' },
      { key: 'option_d', text: question.option_d, letter: 'D' },
    ];
    return shuffleArray(options);
  };

  useEffect(() => {
    loadExam();
    loadAttempts();
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

      // Obtener las preguntas del examen (vista segura sin correct_answer)
      const { data: questionsData, error: questionsError } = await supabase
        .from('exam_questions_safe' as any)
        .select('*')
        .eq('exam_id', exam.id);

      if (questionsError) throw questionsError;
      
      // Validar que el examen tenga preguntas
      if (!questionsData || questionsData.length === 0) {
        toast({
          title: "Examen en construcción",
          description: "Este examen aún no tiene preguntas configuradas. Por favor contacta al administrador.",
          variant: "destructive",
        });
        navigate(`/lesson/${lessonId}`);
        return;
      }
      
      setQuestions((questionsData as unknown as Question[]) || []);
      
      // Aleatorizar preguntas
      const shuffled = shuffleArray((questionsData as unknown as Question[]) || []);
      setShuffledQuestions(shuffled);
      
      // Crear opciones mezcladas para cada pregunta
      const optionsMap: Record<string, ShuffledOption[]> = {};
      shuffled.forEach(q => {
        optionsMap[q.id] = createShuffledOptions(q);
      });
      setShuffledOptions(optionsMap);

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

  const loadAttempts = async () => {
    if (!lessonId || !user) return;

    try {
      const { data: exam } = await supabase
        .from('exams')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (!exam) return;

      const { data, error } = await supabase
        .from('exam_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('exam_id', exam.id);

      if (error) throw error;
      setAttempts(data?.length || 0);
    } catch (error: any) {
      console.error('Error loading attempts:', error);
    }
  };


  const handleSubmit = async () => {
    if (!user || !examId || !lessonId) return;

    // Validate all answers
    const invalidAnswers = Object.values(answers).filter(
      answer => !examAnswerSchema.safeParse(answer).success
    );

    if (invalidAnswers.length > 0) {
      toast({
        title: "Error de validación",
        description: "Una o más respuestas son inválidas",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send answers to server for grading (server-side validation)
      const answersData = questions.reduce((acc, q) => {
        acc[q.id] = answers[q.id] || '';
        return acc;
      }, {} as Record<string, string>);

      const { data, error } = await supabase.rpc('submit_exam_attempt', {
        _exam_id: examId,
        _lesson_id: lessonId,
        _answers: answersData,
        _score: 0,
        _passed: false
      });

      if (error) throw error;

      const serverResult = data as any;
      const serverScore = serverResult?.score ?? 0;
      const serverPassed = serverResult?.passed ?? false;
      
      setScore(serverScore);
      setSubmitted(true);

      if (serverPassed) {
        toast({
          title: "¡Excelente trabajo!",
          description: `Has aprobado con ${serverScore}%. La siguiente clase está desbloqueada.`,
        });
      } else {
        toast({
          title: "Necesitas mejorar",
          description: `Has obtenido ${serverScore}%. Necesitas 80% para aprobar.`,
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
    
    // Aleatorizar de nuevo
    const shuffled = shuffleArray(questions);
    setShuffledQuestions(shuffled);
    
    const optionsMap: Record<string, ShuffledOption[]> = {};
    shuffled.forEach(q => {
      optionsMap[q.id] = createShuffledOptions(q);
    });
    setShuffledOptions(optionsMap);
    
    loadAttempts();
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
        <div className="glass-card p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">Examen del Módulo</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Necesitas 80% o más para aprobar y desbloquear la siguiente clase
            </p>
            {attempts > 0 && !submitted && (
              <p className="text-xs md:text-sm text-primary mt-2">
                Intento #{attempts + 1}
              </p>
            )}
          </div>

          {!submitted ? (
            <div className="space-y-6 md:space-y-8">
              {shuffledQuestions.map((question, idx) => {
                const options = shuffledOptions[question.id] || [];
                const hasFailedBefore = attempts > 0;
                
                return (
                  <div key={question.id} className="space-y-4">
                    <h3 className="text-base md:text-lg font-semibold">
                      {idx + 1}. {question.question_text}
                    </h3>
                    
                    {hasFailedBefore && question.hint && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <p className="text-xs md:text-sm text-primary">
                          💡 <span className="font-medium">Pista:</span> {question.hint}
                        </p>
                      </div>
                    )}
                    
                    <RadioGroup
                      value={answers[question.id]}
                      onValueChange={(value) =>
                        setAnswers({ ...answers, [question.id]: value })
                      }
                    >
                      {options.map((opt) => (
                        <div
                          key={opt.key}
                          className="flex items-center space-x-2 p-3 rounded-lg hover:bg-card transition-colors"
                        >
                          <RadioGroupItem
                            value={opt.key}
                            id={`q${question.id}-${opt.key}`}
                          />
                          <Label
                            htmlFor={`q${question.id}-${opt.key}`}
                            className="flex-1 cursor-pointer text-sm md:text-base"
                          >
                            {opt.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                );
              })}

              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== shuffledQuestions.length}
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

              {/* Answer Review - answers are validated server-side */}
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold">Revisión de Respuestas</h3>
                {shuffledQuestions.map((question, idx) => {
                  const userAnswer = answers[question.id];
                  return (
                    <div
                      key={question.id}
                      className="p-3 md:p-4 rounded-lg border border-border/50"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-semibold mb-2">
                            {idx + 1}. {question.question_text}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Tu respuesta:{" "}
                            <span>
                              {userAnswer ? question[userAnswer as keyof Question] as string : 'No respondida'}
                            </span>
                          </p>
                          {question.hint && (
                            <p className="text-xs text-primary/80 mt-2 italic">
                              💡 {question.hint}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
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