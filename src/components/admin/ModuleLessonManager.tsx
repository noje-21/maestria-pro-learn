import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Module {
  id: string;
  module_number: number;
  title: string;
  description: string | null;
  is_active: boolean;
  instructor: string | null;
  date: string | null;
}

interface Lesson {
  id: string;
  module_id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  is_active: boolean;
}

export const ModuleLessonManager = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .order("module_number");

      if (modulesError) throw modulesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_number");

      if (lessonsError) throw lessonsError;

      setModules(modulesData || []);
      setLessons(lessonsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveModule = async (module: Partial<Module>) => {
    try {
      if (module.id) {
        const { error } = await supabase
          .from("modules")
          .update({
            title: module.title,
            description: module.description,
            instructor: module.instructor,
            date: module.date,
            is_active: module.is_active,
          })
          .eq("id", module.id);

        if (error) throw error;
        toast({ title: "Módulo actualizado correctamente" });
      } else {
        const maxModuleNumber = modules.length > 0 
          ? Math.max(...modules.map(m => m.module_number))
          : 0;

        const { error } = await supabase
          .from("modules")
          .insert({
            module_number: maxModuleNumber + 1,
            title: module.title || "Nuevo Módulo",
            description: module.description,
            instructor: module.instructor,
            date: module.date,
            is_active: true,
            course_id: (await supabase.from("courses").select("id").limit(1).single()).data?.id,
          });

        if (error) throw error;
        toast({ title: "Módulo creado correctamente" });
      }

      setEditingModule(null);
      setIsAddingModule(false);
      loadData();
    } catch (error: any) {
      console.error("Error saving module:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el módulo",
        variant: "destructive",
      });
    }
  };

  const deleteModule = async (moduleId: string) => {
    try {
      // Primero eliminar las lecciones asociadas
      const { error: lessonsError } = await supabase
        .from("lessons")
        .delete()
        .eq("module_id", moduleId);

      if (lessonsError) throw lessonsError;

      // Luego eliminar el módulo
      const { error: moduleError } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);

      if (moduleError) throw moduleError;

      toast({ title: "Módulo eliminado correctamente" });
      loadData();
    } catch (error: any) {
      console.error("Error deleting module:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el módulo",
        variant: "destructive",
      });
    }
  };

  const saveLesson = async (lesson: Partial<Lesson>) => {
    try {
      if (lesson.id) {
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lesson.title,
            description: lesson.description,
            is_active: lesson.is_active,
          })
          .eq("id", lesson.id);

        if (error) throw error;
        toast({ title: "Lección actualizada correctamente" });
      } else {
        const moduleLessons = lessons.filter(l => l.module_id === lesson.module_id);
        const maxLessonNumber = moduleLessons.length > 0
          ? Math.max(...moduleLessons.map(l => l.lesson_number))
          : 0;

        const { error } = await supabase
          .from("lessons")
          .insert({
            module_id: lesson.module_id,
            lesson_number: maxLessonNumber + 1,
            title: lesson.title || "Nueva Lección",
            description: lesson.description,
            is_active: true,
          });

        if (error) throw error;
        toast({ title: "Lección creada correctamente" });
      }

      setEditingLesson(null);
      setIsAddingLesson(null);
      loadData();
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la lección",
        variant: "destructive",
      });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) throw error;

      toast({ title: "Lección eliminada correctamente" });
      loadData();
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la lección",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-background/50 rounded-lg border border-border">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Cargando módulos y lecciones...</p>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="text-center p-12 space-y-4 bg-background/50 rounded-lg border border-border">
        <p className="text-foreground font-medium">No hay módulos disponibles</p>
        <Button
          onClick={() => setIsAddingModule(true)}
          className="btn-gradient-primary gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear Primer Módulo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Gestión de Módulos y Lecciones</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Administra el contenido del curso
          </p>
        </div>
        <Button
          onClick={() => setIsAddingModule(true)}
          className="btn-gradient-primary gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Agregar Módulo
        </Button>
      </div>

      {/* Formulario de nuevo módulo */}
      {isAddingModule && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Nuevo Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Título del módulo"
                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value } as Module)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción del módulo"
                onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value } as Module)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Input
                  placeholder="Nombre del instructor"
                  onChange={(e) => setEditingModule({ ...editingModule, instructor: e.target.value } as Module)}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  placeholder="Fecha del módulo"
                  onChange={(e) => setEditingModule({ ...editingModule, date: e.target.value } as Module)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => saveModule(editingModule || {})}
                className="btn-gradient-primary gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingModule(false);
                  setEditingModule(null);
                }}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de módulos */}
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="glass-card">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {editingModule?.id === module.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editingModule.title}
                        onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                      />
                      <Textarea
                        value={editingModule.description || ""}
                        onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Instructor"
                          value={editingModule.instructor || ""}
                          onChange={(e) => setEditingModule({ ...editingModule, instructor: e.target.value })}
                        />
                        <Input
                          placeholder="Fecha"
                          value={editingModule.date || ""}
                          onChange={(e) => setEditingModule({ ...editingModule, date: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => saveModule(editingModule)}
                          size="sm"
                          className="btn-gradient-primary"
                        >
                          <Save className="h-4 w-4" />
                          Guardar
                        </Button>
                        <Button
                          onClick={() => setEditingModule(null)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg sm:text-xl break-words">
                        Módulo {module.module_number}: {module.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm break-words">
                        {module.description}
                      </CardDescription>
                      {module.instructor && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                          Instructor: {module.instructor}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {!editingModule && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => setEditingModule(module)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esto eliminará el módulo y todas sus lecciones asociadas.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteModule(module.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
                  <p className="text-sm font-semibold">Lecciones:</p>
                  <Button
                    onClick={() => setIsAddingLesson(module.id)}
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Lección
                  </Button>
                </div>

                {isAddingLesson === module.id && (
                  <div className="p-3 sm:p-4 border rounded-lg space-y-3">
                    <Input
                      placeholder="Título de la lección"
                      onChange={(e) => setEditingLesson({ module_id: module.id, title: e.target.value } as Lesson)}
                    />
                    <Textarea
                      placeholder="Descripción de la lección"
                      onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value } as Lesson)}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => saveLesson(editingLesson || { module_id: module.id })}
                        size="sm"
                        className="btn-gradient-primary"
                      >
                        Guardar
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingLesson(null);
                          setEditingLesson(null);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {lessons
                    .filter((lesson) => lesson.module_id === module.id)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border bg-card"
                      >
                        {editingLesson?.id === lesson.id ? (
                          <div className="space-y-3 flex-1">
                            <Input
                              value={editingLesson.title}
                              onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                            />
                            <Textarea
                              value={editingLesson.description || ""}
                              onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => saveLesson(editingLesson)}
                                size="sm"
                                className="btn-gradient-primary"
                              >
                                Guardar
                              </Button>
                              <Button
                                onClick={() => setEditingLesson(null)}
                                size="sm"
                                variant="ghost"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium break-words">{lesson.title}</span>
                              {lesson.description && (
                                <p className="text-xs text-muted-foreground mt-1 break-words">
                                  {lesson.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                onClick={() => setEditingLesson(lesson)}
                                size="sm"
                                variant="ghost"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar lección?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteLesson(lesson.id)}>
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
