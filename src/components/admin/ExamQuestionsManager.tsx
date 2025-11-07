import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit, Save, X, FileQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Exam {
  id: string;
  title: string;
  lesson_id: string;
}

interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  hint: string | null;
}

interface Lesson {
  id: string;
  title: string;
}

export const ExamQuestionsManager = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    hint: "",
  });

  useEffect(() => {
    loadLessons();
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      const exam = exams.find(e => e.lesson_id === selectedLessonId);
      setSelectedExam(exam || null);
      if (exam) {
        loadQuestions(exam.id);
      } else {
        setQuestions([]);
      }
    }
  }, [selectedLessonId, exams]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title")
        .order("lesson_number");

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
    }
  };

  const loadExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*");

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error loading exams:", error);
    }
  };

  const loadQuestions = async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", examId)
        .order("created_at");

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const createExam = async () => {
    if (!selectedLessonId) return;

    setLoading(true);
    try {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      const { data, error } = await supabase
        .from("exams")
        .insert({
          lesson_id: selectedLessonId,
          title: `Examen - ${lesson?.title}`,
          passing_score: 80
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Examen creado",
        description: "El examen se ha creado correctamente",
      });

      loadExams();
    } catch (error: any) {
      console.error("Error creating exam:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el examen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async () => {
    if (!selectedExam) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", selectedExam.id);

      if (error) throw error;

      toast({
        title: "Examen eliminado",
        description: "El examen se ha eliminado correctamente",
      });

      setSelectedExam(null);
      setQuestions([]);
      loadExams();
    } catch (error: any) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el examen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuestion = async () => {
    if (!selectedExam) return;

    if (!newQuestion.question_text || !newQuestion.option_a || 
        !newQuestion.option_b || !newQuestion.option_c || !newQuestion.option_d) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("exam_questions")
        .insert({
          exam_id: selectedExam.id,
          question_text: newQuestion.question_text,
          option_a: newQuestion.option_a,
          option_b: newQuestion.option_b,
          option_c: newQuestion.option_c,
          option_d: newQuestion.option_d,
          correct_answer: newQuestion.correct_answer,
          hint: newQuestion.hint || null,
        });

      if (error) throw error;

      toast({
        title: "Pregunta agregada",
        description: "La pregunta se ha agregado correctamente",
      });

      setNewQuestion({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        hint: "",
      });
      setIsCreating(false);
      loadQuestions(selectedExam.id);
    } catch (error: any) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la pregunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("exam_questions")
        .update({
          question_text: editingQuestion.question_text,
          option_a: editingQuestion.option_a,
          option_b: editingQuestion.option_b,
          option_c: editingQuestion.option_c,
          option_d: editingQuestion.option_d,
          correct_answer: editingQuestion.correct_answer,
          hint: editingQuestion.hint || null,
        })
        .eq("id", editingQuestion.id);

      if (error) throw error;

      toast({
        title: "Pregunta actualizada",
        description: "La pregunta se ha actualizado correctamente",
      });

      setEditingQuestion(null);
      if (selectedExam) loadQuestions(selectedExam.id);
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la pregunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("exam_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Pregunta eliminada",
        description: "La pregunta se ha eliminado correctamente",
      });

      if (selectedExam) loadQuestions(selectedExam.id);
    } catch (error: any) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la pregunta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4">Gestionar Exámenes y Preguntas</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Lección
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una lección" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLessonId && (
            <div className="border-t pt-4 space-y-4">
              {!selectedExam ? (
                <div className="text-center py-8">
                  <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta lección no tiene un examen asignado
                  </p>
                  <Button
                    onClick={createExam}
                    disabled={loading}
                    className="btn-gradient-primary gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Examen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between p-4 bg-muted/20 rounded-lg border">
                    <div>
                      <p className="font-semibold">{selectedExam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {questions.length} pregunta(s)
                      </p>
                    </div>
                    <Button
                      onClick={deleteExam}
                      disabled={loading}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Examen
                    </Button>
                  </div>

                  {/* Lista de preguntas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Preguntas</h4>
                      <Button
                        onClick={() => setIsCreating(true)}
                        className="btn-gradient-primary gap-2"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Nueva Pregunta
                      </Button>
                    </div>

                    {/* Formulario de nueva pregunta */}
                    {isCreating && (
                      <Card className="p-4 bg-card/50">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Pregunta *</label>
                            <Textarea
                              placeholder="Escribe la pregunta..."
                              value={newQuestion.question_text}
                              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                              className="min-h-[80px]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Opción A *</label>
                              <Input
                                placeholder="Respuesta A"
                                value={newQuestion.option_a}
                                onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Opción B *</label>
                              <Input
                                placeholder="Respuesta B"
                                value={newQuestion.option_b}
                                onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Opción C *</label>
                              <Input
                                placeholder="Respuesta C"
                                value={newQuestion.option_c}
                                onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Opción D *</label>
                              <Input
                                placeholder="Respuesta D"
                                value={newQuestion.option_d}
                                onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Respuesta Correcta *</label>
                            <Select 
                              value={newQuestion.correct_answer} 
                              onValueChange={(value) => setNewQuestion({ ...newQuestion, correct_answer: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">A</SelectItem>
                                <SelectItem value="B">B</SelectItem>
                                <SelectItem value="C">C</SelectItem>
                                <SelectItem value="D">D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-1 block">Pista (opcional)</label>
                            <Textarea
                              placeholder="Pista o ayuda para esta pregunta..."
                              value={newQuestion.hint}
                              onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={saveQuestion}
                              disabled={loading}
                              className="flex-1 btn-gradient-primary gap-2"
                            >
                              <Save className="h-4 w-4" />
                              Guardar
                            </Button>
                            <Button
                              onClick={() => setIsCreating(false)}
                              variant="outline"
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Lista de preguntas existentes */}
                    {questions.map((question, idx) => (
                      <Card key={question.id} className="p-4">
                        {editingQuestion?.id === question.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Pregunta</label>
                              <Textarea
                                value={editingQuestion.question_text}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                                className="min-h-[80px]"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <Input
                                placeholder="Opción A"
                                value={editingQuestion.option_a}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, option_a: e.target.value })}
                              />
                              <Input
                                placeholder="Opción B"
                                value={editingQuestion.option_b}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, option_b: e.target.value })}
                              />
                              <Input
                                placeholder="Opción C"
                                value={editingQuestion.option_c}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, option_c: e.target.value })}
                              />
                              <Input
                                placeholder="Opción D"
                                value={editingQuestion.option_d}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, option_d: e.target.value })}
                              />
                            </div>

                            <Select 
                              value={editingQuestion.correct_answer} 
                              onValueChange={(value) => setEditingQuestion({ ...editingQuestion, correct_answer: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Correcta: A</SelectItem>
                                <SelectItem value="B">Correcta: B</SelectItem>
                                <SelectItem value="C">Correcta: C</SelectItem>
                                <SelectItem value="D">Correcta: D</SelectItem>
                              </SelectContent>
                            </Select>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Pista</label>
                              <Textarea
                                placeholder="Pista opcional..."
                                value={editingQuestion.hint || ""}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, hint: e.target.value })}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={updateQuestion}
                                disabled={loading}
                                className="flex-1 btn-gradient-primary gap-2"
                                size="sm"
                              >
                                <Save className="h-4 w-4" />
                                Actualizar
                              </Button>
                              <Button
                                onClick={() => setEditingQuestion(null)}
                                variant="outline"
                                className="flex-1"
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold mb-2">
                                  {idx + 1}. {question.question_text}
                                </p>
                                <div className="space-y-1 text-sm">
                                  <p className={question.correct_answer === 'A' ? 'text-success font-medium' : ''}>A) {question.option_a}</p>
                                  <p className={question.correct_answer === 'B' ? 'text-success font-medium' : ''}>B) {question.option_b}</p>
                                  <p className={question.correct_answer === 'C' ? 'text-success font-medium' : ''}>C) {question.option_c}</p>
                                  <p className={question.correct_answer === 'D' ? 'text-success font-medium' : ''}>D) {question.option_d}</p>
                                </div>
                                {question.hint && (
                                  <p className="text-xs text-muted-foreground mt-2 italic">
                                    💡 Pista: {question.hint}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  onClick={() => setEditingQuestion(question)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteQuestion(question.id)}
                                  disabled={loading}
                                  variant="destructive"
                                  size="sm"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}

                    {questions.length === 0 && !isCreating && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No hay preguntas en este examen
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};