import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, BookOpen, GraduationCap } from "lucide-react";

interface StudentProgress {
  user_id: string;
  user_name: string;
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  course_title: string;
  completed: boolean;
  completed_at: string | null;
  lesson_number: number;
  module_number: number;
}

export const StudentProgressView = () => {
  const { toast } = useToast();
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [filteredProgress, setFilteredProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    filterProgress();
  }, [selectedUser, selectedCourse, progress]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_student_progress");

      if (error) throw error;

      setProgress(data || []);

      // Extract unique users and courses
      const uniqueUsers = Array.from(
        new Map(data?.map((p) => [p.user_id, { id: p.user_id, name: p.user_name }]) || []).values()
      );
      const uniqueCourses = Array.from(
        new Set(data?.map((p) => p.course_title) || [])
      );

      setUsers(uniqueUsers);
      setCourses(uniqueCourses);
    } catch (error) {
      console.error("Error loading progress:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el progreso de los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProgress = () => {
    let filtered = [...progress];

    if (selectedUser !== "all") {
      filtered = filtered.filter((p) => p.user_id === selectedUser);
    }

    if (selectedCourse !== "all") {
      filtered = filtered.filter((p) => p.course_title === selectedCourse);
    }

    setFilteredProgress(filtered);
  };

  const calculateStats = () => {
    const totalLessons = filteredProgress.length;
    const completedLessons = filteredProgress.filter((p) => p.completed).length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, completionRate };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-background/50 rounded-lg border border-border">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Filtros</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Estudiante</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estudiantes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estudiantes</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Curso</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los cursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Lecciones</p>
              <p className="text-3xl font-bold">{stats.totalLessons}</p>
            </div>
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completadas</p>
              <p className="text-3xl font-bold text-green-500">{stats.completedLessons}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tasa de Completado</p>
              <p className="text-3xl font-bold text-primary">{stats.completionRate}%</p>
            </div>
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Progress Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Progreso Detallado</h3>
        <div className="overflow-x-auto">
          {filteredProgress.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos de progreso disponibles
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Estudiante</th>
                  <th className="text-left py-3 px-4 font-semibold">Curso</th>
                  <th className="text-left py-3 px-4 font-semibold">Módulo</th>
                  <th className="text-left py-3 px-4 font-semibold">Lección</th>
                  <th className="text-center py-3 px-4 font-semibold">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold">Fecha Completado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgress.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-3 px-4">{item.user_name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {item.course_title}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {item.module_number}. {item.module_title}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {item.lesson_number}. {item.lesson_title}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 inline-block" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground inline-block" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {item.completed_at
                        ? new Date(item.completed_at).toLocaleDateString("es-ES")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};
