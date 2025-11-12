import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";

interface Module {
  id: string;
  module_number: number;
  title: string;
  is_active: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  is_active: boolean;
}

export const ModuleVisibilityManager = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModulesAndLessons();
  }, []);

  const loadModulesAndLessons = async () => {
    try {
      setLoading(true);

      // Cargar módulos
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("*")
        .order("module_number");

      if (modulesError) throw modulesError;

      // Cargar lecciones
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .order("lesson_number");

      if (lessonsError) throw lessonsError;

      // Organizar módulos con sus lecciones
      const modulesWithLessons = modulesData!.map((module) => ({
        ...module,
        lessons: lessonsData!.filter((lesson) => lesson.module_id === module.id),
      }));

      setModules(modulesWithLessons);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los módulos y lecciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleVisibility = (moduleId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? { ...module, is_active: !module.is_active }
          : module
      )
    );
  };

  const toggleLessonVisibility = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? { ...lesson, is_active: !lesson.is_active }
                  : lesson
              ),
            }
          : module
      )
    );
  };

  const saveChanges = async () => {
    try {
      setSaving(true);

      // Actualizar módulos
      for (const module of modules) {
        const { error: moduleError } = await supabase
          .from("modules")
          .update({ is_active: module.is_active })
          .eq("id", module.id);

        if (moduleError) throw moduleError;

        // Actualizar lecciones
        for (const lesson of module.lessons) {
          const { error: lessonError } = await supabase
            .from("lessons")
            .update({ is_active: lesson.is_active })
            .eq("id", lesson.id);

          if (lessonError) throw lessonError;
        }
      }

      toast({
        title: "Cambios guardados",
        description: "La visibilidad de módulos y lecciones se actualizó correctamente",
      });
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-background/50 rounded-lg border border-border">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gestión de Visibilidad</h2>
          <p className="text-muted-foreground">
            Controla qué módulos y lecciones están visibles para los estudiantes
          </p>
        </div>
        <Button
          onClick={saveChanges}
          disabled={saving}
          className="btn-gradient-primary gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="glass-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-primary">Módulo {module.module_number}:</span>
                    {module.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {module.lessons.length} lección(es)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {module.is_active ? (
                    <Eye className="h-4 w-4 text-success" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={module.is_active}
                    onCheckedChange={() => toggleModuleVisibility(module.id)}
                  />
                </div>
              </div>
            </CardHeader>

            {module.lessons.length > 0 && (
              <CardContent>
                <div className="space-y-2 border-t pt-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">
                    Lecciones:
                  </p>
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="text-sm">{lesson.title}</span>
                      <div className="flex items-center gap-2">
                        {lesson.is_active ? (
                          <Eye className="h-3 w-3 text-success" />
                        ) : (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        )}
                        <Switch
                          checked={lesson.is_active}
                          onCheckedChange={() =>
                            toggleLessonVisibility(module.id, lesson.id)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
