import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    level: string;
    modules_count: number;
    start_date: string | null;
    is_enrolled?: boolean;
    progress?: number;
  };
  index: number;
  onClick: () => void;
}

export const CourseCard = ({ course, index, onClick }: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return 'bg-success/10 text-success border-success/20';
      case 'medio':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'avanzado':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'maestría':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow h-full flex flex-col"
        onClick={onClick}
      >
        {/* Course Image */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="h-16 w-16 text-primary/50" />
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            {course.is_enrolled && (
              <Badge className="bg-success text-white border-0 shadow-lg">
                Inscrito
              </Badge>
            )}
          </div>

          {/* Progress bar overlay (only for enrolled courses) */}
          {course.is_enrolled && course.progress !== undefined && course.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-3">
              {course.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.modules_count} módulos</span>
            </div>
            {course.start_date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(course.start_date).getFullYear()}</span>
              </div>
            )}
          </div>

          {/* Progress (for enrolled courses) */}
          {course.is_enrolled && course.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-semibold text-primary">{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-1.5" />
            </div>
          )}

          {/* Action Button */}
          <Button
            className={
              course.is_enrolled
                ? "w-full btn-gradient-primary group-hover:shadow-glow"
                : "w-full"
            }
            variant={course.is_enrolled ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {course.is_enrolled ? (
              <>
                <Award className="h-4 w-4 mr-2" />
                Continuar
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            ) : (
              "Ver Detalles"
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
