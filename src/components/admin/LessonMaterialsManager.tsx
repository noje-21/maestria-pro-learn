import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Material {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
}

interface Lesson {
  id: string;
  title: string;
}

export const LessonMaterialsManager = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState({ url: "", title: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      loadMaterials(selectedLessonId);
    }
  }, [selectedLessonId]);

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
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecciones",
        variant: "destructive",
      });
    }
  };

  const loadMaterials = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from("lesson_materials")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at");

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error("Error loading materials:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive",
      });
    }
  };

  const addMaterial = async () => {
    if (!selectedLessonId || !newMaterial.url.trim() || !newMaterial.title.trim()) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("lesson_materials").insert({
        lesson_id: selectedLessonId,
        file_url: newMaterial.url,
        title: newMaterial.title,
      });

      if (error) throw error;

      toast({
        title: "Material agregado",
        description: "El material se ha agregado correctamente",
      });

      setNewMaterial({ url: "", title: "" });
      loadMaterials(selectedLessonId);
    } catch (error) {
      console.error("Error adding material:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el material",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (materialId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("lesson_materials")
        .delete()
        .eq("id", materialId);

      if (error) throw error;

      toast({
        title: "Material eliminado",
        description: "El material se ha eliminado correctamente",
      });

      loadMaterials(selectedLessonId);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el material",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Gestionar Materiales de Lecciones</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Lección
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
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
            <>
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold">Agregar Nuevo Material</h4>
                <Input
                  placeholder="Título del material"
                  value={newMaterial.title}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, title: e.target.value })
                  }
                />
                <Input
                  placeholder="URL del archivo (PDF, documento, etc.)"
                  value={newMaterial.url}
                  onChange={(e) =>
                    setNewMaterial({ ...newMaterial, url: e.target.value })
                  }
                />
                <Button
                  onClick={addMaterial}
                  disabled={loading}
                  className="btn-gradient-primary gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Material
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">
                  Materiales Actuales ({materials.length})
                </h4>
                <div className="space-y-2">
                  {materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay materiales para esta lección
                    </p>
                  ) : (
                    materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {material.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {material.file_url}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMaterial(material.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
