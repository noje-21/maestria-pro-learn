import { memo } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  Layers, 
  Calendar,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  PlayCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CourseOverviewProps {
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    level: string;
    start_date: string | null;
    end_date: string | null;
  };
  stats: {
    totalModules: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
  instructors: string[];
  onContinue: () => void;
  lastLessonTitle?: string;
}

const StatCard = memo(({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/30 transition-colors h-full">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    </Card>
  </motion.div>
));

StatCard.displayName = "StatCard";

const CourseOverviewComponent = ({
  course,
  stats,
  instructors,
  onContinue,
  lastLessonTitle,
}: CourseOverviewProps) => {
  const getLevelConfig = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30', icon: '🌱' };
      case 'medio':
        return { bg: 'bg-sky-500/10', text: 'text-sky-500', border: 'border-sky-500/30', icon: '📚' };
      case 'avanzado':
        return { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30', icon: '🚀' };
      case 'maestría':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30', icon: '👑' };
      default:
        return { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-muted/30', icon: '📖' };
    }
  };

  const levelConfig = getLevelConfig(course.level);
  const isComplete = stats.progress >= 100;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Background */}
        <div className="absolute inset-0 h-[280px] md:h-[320px]">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 pt-24 md:pt-32">
          <Badge className={cn("mb-3", levelConfig.bg, levelConfig.text, levelConfig.border, "border")}>
            <span className="mr-1">{levelConfig.icon}</span>
            {course.level}
          </Badge>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 max-w-3xl">
            {course.title}
          </h1>
          
          <p className="text-muted-foreground max-w-2xl line-clamp-2 md:line-clamp-3 mb-6">
            {course.description}
          </p>

          {/* Instructors */}
          {instructors.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Users className="h-4 w-4" />
              <span>Instructores: {instructors.join(', ')}</span>
            </div>
          )}

          {/* CTA */}
          {!isComplete && (
            <Button
              size="lg"
              onClick={onContinue}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
            >
              <PlayCircle className="h-5 w-5" />
              {stats.progress > 0 ? 'Continuar aprendiendo' : 'Comenzar curso'}
            </Button>
          )}
          {isComplete && (
            <Badge className="text-base px-4 py-2 bg-emerald-500/20 text-emerald-500 border-emerald-500/30 border">
              <Award className="h-5 w-5 mr-2" />
              ¡Curso completado!
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 md:p-6 border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isComplete ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/20 text-primary"
              )}>
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">Tu progreso</h3>
                {lastLessonTitle && stats.progress > 0 && stats.progress < 100 && (
                  <p className="text-sm text-muted-foreground">
                    Última lección: {lastLessonTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-3xl font-bold",
                isComplete ? "text-emerald-500" : "text-primary"
              )}>
                {Math.round(stats.progress)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.completedLessons} de {stats.totalLessons} lecciones
              </p>
            </div>
          </div>
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                isComplete 
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        <StatCard
          icon={Layers}
          label="Módulos"
          value={stats.totalModules}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={BookOpen}
          label="Lecciones"
          value={stats.totalLessons}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completadas"
          value={stats.completedLessons}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Nivel"
          value={course.level}
          color="bg-violet-500/10 text-violet-500"
        />
      </motion.div>

      {/* Dates */}
      {(course.start_date || course.end_date) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                {course.start_date && (
                  <span>
                    Inicio: {new Date(course.start_date).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
                {course.start_date && course.end_date && <span className="mx-2">•</span>}
                {course.end_date && (
                  <span>
                    Fin: {new Date(course.end_date).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export const CourseOverview = memo(CourseOverviewComponent);
