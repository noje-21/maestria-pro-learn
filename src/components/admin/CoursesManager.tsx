import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export const CoursesManager = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    level: "maestría",
    status: "active",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Actualizar curso existente
        const { error } = await supabase
          .from('courses')
          .update({
            title: formData.title,
            description: formData.description || null,
            image_url: formData.image_url || null,
            level: formData.level,
            status: formData.status,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          })
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: "Curso actualizado",
          description: "El curso se actualizó correctamente",
        });
      } else {
        // Crear nuevo curso
        const { error } = await supabase.from('courses').insert({
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url || null,
          level: formData.level,
          status: formData.status,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          is_active: true,
        });

        if (error) throw error;

        toast({
          title: "Curso creado",
          description: "El nuevo curso se creó correctamente",
        });
      }

      resetForm();
      loadCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el curso",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      description: course.description || "",
      image_url: course.image_url || "",
      level: course.level,
      status: course.status,
      start_date: course.start_date || "",
      end_date: course.end_date || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este curso?")) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Curso eliminado",
        description: "El curso se eliminó correctamente",
      });

      loadCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el curso",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      level: "maestría",
      status: "active",
      start_date: "",
      end_date: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Editar Curso" : "Crear Nuevo Curso"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título del Curso *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ej: Maestría en Circulación Pulmonar"
              />
            </div>

            <div>
              <Label htmlFor="level">Nivel</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="básico">Básico</SelectItem>
                  <SelectItem value="medio">Medio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                  <SelectItem value="maestría">Maestría</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Descripción del curso..."
            />
          </div>

          <div>
            <Label htmlFor="image_url">URL de Imagen (Portada)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Fecha Inicio</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Fecha Fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="btn-gradient-primary">
              <Save className="h-4 w-4 mr-2" />
              {editingId ? "Actualizar" : "Crear Curso"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cursos Existentes</h3>
        
        {courses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay cursos creados</p>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                      {course.level}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      course.status === 'active' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-muted/10 text-muted-foreground'
                    }`}>
                      {course.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                    {!course.is_active && (
                      <span className="px-2 py-1 rounded bg-secondary/10 text-secondary">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(course)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
