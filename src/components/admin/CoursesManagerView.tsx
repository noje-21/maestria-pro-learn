import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, Column, Action } from "@/components/common/DataTable";
import { Plus, Pencil, Trash2, Save, X, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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

const initialFormData = {
  title: "",
  description: "",
  image_url: "",
  level: "maestría",
  status: "active",
  start_date: "",
  end_date: "",
};

export const CoursesManagerView = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);

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

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        level: formData.level,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast({ title: "Curso actualizado correctamente" });
      } else {
        const { error } = await supabase.from('courses').insert({
          ...courseData,
          is_active: true,
        });

        if (error) throw error;
        toast({ title: "Curso creado correctamente" });
      }

      closeDialog();
      loadCourses();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el curso",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({ title: "Curso eliminado correctamente" });
      loadCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el curso",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      image_url: course.image_url || "",
      level: course.level,
      status: course.status,
      start_date: course.start_date || "",
      end_date: course.end_date || "",
    });
    setShowDialog(true);
  };

  const openCreateDialog = () => {
    setEditingCourse(null);
    setFormData(initialFormData);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingCourse(null);
    setFormData(initialFormData);
  };

  const columns: Column<Course>[] = useMemo(() => [
    {
      key: "title",
      header: "Curso",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{row.title}</p>
            <p className="text-xs text-muted-foreground truncate max-w-xs">
              {row.description || "Sin descripción"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: "Nivel",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.level}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => (
        <Badge 
          variant={row.status === 'active' ? "default" : "secondary"}
          className={row.status === 'active' ? "bg-success/20 text-success hover:bg-success/30" : ""}
        >
          {row.status === 'active' ? 'Activo' : 'Borrador'}
        </Badge>
      ),
    },
    {
      key: "is_active",
      header: "Visibilidad",
      cell: (row) => (
        <span className={`text-sm ${row.is_active ? 'text-success' : 'text-muted-foreground'}`}>
          {row.is_active ? 'Visible' : 'Oculto'}
        </span>
      ),
    },
  ], []);

  const actions: Action<Course>[] = useMemo(() => [
    {
      icon: Pencil,
      label: "Editar curso",
      variant: "ghost" as const,
      onClick: (row) => openEditDialog(row),
    },
    {
      icon: Trash2,
      label: "Eliminar curso",
      variant: "ghost" as const,
      onClick: (row) => setDeleteId(row.id),
    },
  ], []);

  // Stats
  const stats = useMemo(() => ({
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    draft: courses.filter(c => c.status !== 'active').length,
    visible: courses.filter(c => c.is_active).length,
  }), [courses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Cursos</h2>
          <p className="text-muted-foreground">Administra los cursos de la plataforma</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Curso
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Activos", value: stats.active, color: "text-success" },
          { label: "Borradores", value: stats.draft, color: "text-yellow-500" },
          { label: "Visibles", value: stats.visible, color: "text-primary" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <Card className="p-4 lg:p-6">
        <DataTable
          data={courses}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable
          searchPlaceholder="Buscar cursos..."
          searchKeys={["title", "description"]}
          emptyMessage="No hay cursos creados"
          pageSize={10}
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Modifica los datos del curso" : "Ingresa los datos del nuevo curso"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Maestría en Circulación Pulmonar"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Descripción del curso..."
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL de Imagen</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Nivel</Label>
                <Select 
                  value={formData.level} 
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                  disabled={saving}
                >
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

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Fecha Inicio</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha Fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingCourse ? "Actualizar" : "Crear"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el curso y todos sus datos asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
