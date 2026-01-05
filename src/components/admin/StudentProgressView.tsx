import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, Column } from "@/components/common/DataTable";
import { CheckCircle, XCircle, BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

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
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_student_progress");

      if (error) throw error;
      setProgress(data || []);
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

  // Derived data
  const users = useMemo(() => {
    return Array.from(
      new Map(progress.map((p) => [p.user_id, { id: p.user_id, name: p.user_name }])).values()
    );
  }, [progress]);

  const courses = useMemo(() => {
    return Array.from(new Set(progress.map((p) => p.course_title)));
  }, [progress]);

  const filteredProgress = useMemo(() => {
    let filtered = [...progress];

    if (selectedUser !== "all") {
      filtered = filtered.filter((p) => p.user_id === selectedUser);
    }

    if (selectedCourse !== "all") {
      filtered = filtered.filter((p) => p.course_title === selectedCourse);
    }

    return filtered;
  }, [progress, selectedUser, selectedCourse]);

  const stats = useMemo(() => {
    const totalLessons = filteredProgress.length;
    const completedLessons = filteredProgress.filter((p) => p.completed).length;
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const uniqueStudents = new Set(filteredProgress.map(p => p.user_id)).size;

    return { totalLessons, completedLessons, completionRate, uniqueStudents };
  }, [filteredProgress]);

  const columns: Column<StudentProgress>[] = useMemo(() => [
    {
      key: "user_name",
      header: "Estudiante",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.user_name}</span>
        </div>
      ),
    },
    {
      key: "course_title",
      header: "Curso",
      cell: (row) => (
        <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
          {row.course_title}
        </span>
      ),
    },
    {
      key: "module_title",
      header: "Módulo",
      cell: (row) => (
        <span className="text-sm">
          {row.module_number}. {row.module_title}
        </span>
      ),
    },
    {
      key: "lesson_title",
      header: "Lección",
      cell: (row) => (
        <span className="text-sm">
          {row.lesson_number}. {row.lesson_title}
        </span>
      ),
    },
    {
      key: "completed",
      header: "Estado",
      cell: (row) => (
        <Badge 
          variant={row.completed ? "default" : "secondary"}
          className={row.completed ? "bg-success/20 text-success hover:bg-success/30" : ""}
        >
          {row.completed ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Completada</>
          ) : (
            <><XCircle className="h-3 w-3 mr-1" /> Pendiente</>
          )}
        </Badge>
      ),
    },
    {
      key: "completed_at",
      header: "Fecha",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.completed_at
            ? new Date(row.completed_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      ),
    },
  ], []);

  const statsCards = [
    {
      label: "Total Lecciones",
      value: stats.totalLessons,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Completadas",
      value: stats.completedLessons,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Tasa Completado",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Estudiantes",
      value: stats.uniqueStudents,
      icon: GraduationCap,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Progreso de Estudiantes</h2>
        <p className="text-muted-foreground">Monitorea el avance de los estudiantes en los cursos</p>
      </div>

      {/* Filters */}
      <Card className="p-4 lg:p-6">
        <div className="grid sm:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <Card className="p-4 lg:p-6">
        <DataTable
          data={filteredProgress}
          columns={columns}
          loading={loading}
          searchable
          searchPlaceholder="Buscar por estudiante o lección..."
          searchKeys={["user_name", "lesson_title", "module_title"]}
          emptyMessage="No hay datos de progreso disponibles"
          pageSize={15}
        />
      </Card>
    </div>
  );
};
