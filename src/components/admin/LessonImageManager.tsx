import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lesson {
  id: string;
  title: string;
  image_url: string | null;
}

export const LessonImageManager = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      const lesson = lessons.find(l => l.id === selectedLessonId);
      setSelectedLesson(lesson || null);
    }
  }, [selectedLessonId, lessons]);

  const loadLessons = async () => {
    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, image_url")
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
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedLessonId || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedLessonId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Subir archivo a Storage
      const { error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(filePath);

      // Actualizar la lección con la URL de la imagen
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ image_url: publicUrl })
        .eq('id', selectedLessonId);

      if (updateError) throw updateError;

      toast({
        title: "Imagen subida",
        description: "La imagen se ha cargado correctamente",
      });

      loadLessons();
      // Limpiar el input
      event.target.value = '';
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!selectedLesson?.image_url) return;

    setLoading(true);
    try {
      // Extraer el nombre del archivo de la URL
      const fileName = selectedLesson.image_url.split('/').pop();
      
      if (fileName) {
        // Eliminar archivo de Storage
        const { error: deleteError } = await supabase.storage
          .from('lesson-images')
          .remove([fileName]);

        if (deleteError) throw deleteError;
      }

      // Actualizar la lección para quitar la URL
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ image_url: null })
        .eq('id', selectedLessonId);

      if (updateError) throw updateError;

      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      });

      loadLessons();
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando imágenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 border-primary/20 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold mb-4">Gestionar Imágenes de Lecciones</h3>

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

          {selectedLesson && (
            <div className="border-t pt-4 space-y-4">
              {selectedLesson.image_url ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Imagen actual:</p>
                  <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20">
                    <img 
                      src={selectedLesson.image_url} 
                      alt={selectedLesson.title}
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleDeleteImage}
                    disabled={loading}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Eliminar Imagen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No hay imagen para esta lección
                  </p>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 bg-muted/20">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Sube una imagen para esta lección (máx. 5MB)
                    </p>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Button 
                        type="button"
                        disabled={uploading}
                        className="btn-gradient-primary gap-2"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        Subir Imagen
                      </Button>
                    </label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
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