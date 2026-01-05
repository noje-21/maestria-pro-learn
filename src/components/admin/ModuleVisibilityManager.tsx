import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Eye, EyeOff, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

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
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadModulesAndLessons();
  }, []);

  const loadModulesAndLessons = async () => {
    try {
      setLoading(true);

      const [modulesResult, lessonsResult] = await Promise.all([
        supabase.from("modules").select("*").order("module_number"),
        supabase.from("lessons").select("*").order("lesson_number"),
      ]);

      if (modulesResult.error) throw modulesResult.error;
      if (lessonsResult.error) throw lessonsResult.error;

      const modulesWithLessons = (modulesResult.data || []).map((module) => ({
        ...module,
        lessons: (lessonsResult.data || []).filter((lesson) => lesson.module_id === module.id),
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
    setHasChanges(true);
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
    setHasChanges(true);
  };

  const saveChanges = async () => {
    try {
      setSaving(true);

      // Batch updates
      const moduleUpdates = modules.map((module) =>
        supabase
          .from("modules")
          .update({ is_active: module.is_active })
          .eq("id", module.id)
      );

      const lessonUpdates = modules.flatMap((module) =>
        module.lessons.map((lesson) =>
          supabase
            .from("lessons")
            .update({ is_active: lesson.is_active })
            .eq("id", lesson.id)
        )
      );

      await Promise.all([...moduleUpdates, ...lessonUpdates]);

      toast({
        title: "Cambios guardados",
        description: "La visibilidad se actualizó correctamente",
      });
      setHasChanges(false);
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

  // Stats
  const stats = {
    totalModules: modules.length,
    activeModules: modules.filter((m) => m.is_active).length,
    totalLessons: modules.reduce((acc, m) => acc + m.lessons.length, 0),
    activeLessons: modules.reduce(
      (acc, m) => acc + m.lessons.filter((l) => l.is_active).length,
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground font-medium">Cargando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Visibilidad</h2>
          <p className="text-muted-foreground">
            Controla qué módulos y lecciones están visibles para los estudiantes
          </p>
        </div>
        <Button
          onClick={saveChanges}
          disabled={saving || !hasChanges}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Cambios
          {hasChanges && (
            <Badge variant="secondary" className="ml-1">
              Pendiente
            </Badge>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Módulos", value: `${stats.activeModules}/${stats.totalModules}`, icon: BookOpen, color: "text-primary" },
          { label: "Lecciones", value: `${stats.activeLessons}/${stats.totalLessons}`, icon: GraduationCap, color: "text-success" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="col-span-1"
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label} Visibles</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay módulos disponibles</p>
          </Card>
        ) : (
          modules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Badge variant="outline" className="shrink-0">
                          Módulo {module.module_number}
                        </Badge>
                        <span className="truncate">{module.title}</span>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.lessons.filter((l) => l.is_active).length} de{" "}
                        {module.lessons.length} lecciones visibles
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {module.is_active ? "Visible" : "Oculto"}
                      </span>
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
                  <CardContent className="pt-0">
                    <div className="space-y-2 border-t pt-4">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm text-muted-foreground w-6 shrink-0">
                              {lesson.lesson_number}.
                            </span>
                            <span className="text-sm truncate">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
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
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
