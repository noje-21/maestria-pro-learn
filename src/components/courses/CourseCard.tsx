import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Clock, 
  Award, 
  ArrowRight, 
  Sparkles, 
  TrendingUp,
  Layers,
  Star
} from "lucide-react";
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
    is_new?: boolean;
    is_popular?: boolean;
    is_recommended?: boolean;
  };
  index: number;
  onClick: () => void;
}

const CourseCardComponent = ({ course, index, onClick }: CourseCardProps) => {
  const getLevelConfig = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return { 
          bg: 'bg-emerald-500/15', 
          text: 'text-emerald-400', 
          border: 'border-emerald-500/30',
          icon: '🌱'
        };
      case 'medio':
        return { 
          bg: 'bg-sky-500/15', 
          text: 'text-sky-400', 
          border: 'border-sky-500/30',
          icon: '📚'
        };
      case 'avanzado':
        return { 
          bg: 'bg-violet-500/15', 
          text: 'text-violet-400', 
          border: 'border-violet-500/30',
          icon: '🚀'
        };
      case 'maestría':
        return { 
          bg: 'bg-amber-500/15', 
          text: 'text-amber-400', 
          border: 'border-amber-500/30',
          icon: '👑'
        };
      default:
        return { 
          bg: 'bg-muted/15', 
          text: 'text-muted-foreground', 
          border: 'border-muted/30',
          icon: '📖'
        };
    }
  };

  const levelConfig = getLevelConfig(course.level);

  // Determine if course should show special badges
  const isNew = course.is_new || (course.start_date && 
    new Date(course.start_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const isPopular = course.is_popular || course.modules_count >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
      layout
    >
      <Card
        className="group cursor-pointer overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/60 transition-all duration-500 h-full flex flex-col shadow-lg hover:shadow-2xl hover:shadow-primary/10"
        onClick={onClick}
      >
        {/* Course Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* Background Image */}
          {course.image_url ? (
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-secondary/20 to-primary/10 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent opacity-90" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex flex-wrap gap-1.5">
              {isNew && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08 + 0.2 }}
                >
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-[10px] px-2 py-0.5 font-semibold">
                    <Sparkles className="h-3 w-3 mr-1" />
                    NUEVO
                  </Badge>
                </motion.div>
              )}
              {isPopular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08 + 0.3 }}
                >
                  <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 shadow-lg text-[10px] px-2 py-0.5 font-semibold">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    POPULAR
                  </Badge>
                </motion.div>
              )}
              {course.is_recommended && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.08 + 0.4 }}
                >
                  <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-lg text-[10px] px-2 py-0.5 font-semibold">
                    <Star className="h-3 w-3 mr-1" />
                    RECOMENDADO
                  </Badge>
                </motion.div>
              )}
            </div>
            
            {course.is_enrolled && (
              <Badge className="bg-emerald-500/90 text-white border-0 shadow-lg text-[10px] px-2 py-0.5 font-semibold backdrop-blur-sm">
                ✓ Inscrito
              </Badge>
            )}
          </div>

          {/* Progress Bar Overlay (for enrolled courses) */}
          {course.is_enrolled && course.progress !== undefined && course.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background/30 backdrop-blur-sm">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary via-primary to-emerald-400 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Course Content */}
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Level Badge + Title */}
          <div className="flex-1 space-y-3">
            <Badge 
              className={`${levelConfig.bg} ${levelConfig.text} ${levelConfig.border} border text-xs font-medium px-2.5 py-1`}
            >
              <span className="mr-1.5">{levelConfig.icon}</span>
              {course.level}
            </Badge>
            
            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground py-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium">{course.modules_count} módulos</span>
            </div>
            {course.start_date && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span className="font-medium">{new Date(course.start_date).getFullYear()}</span>
              </div>
            )}
          </div>

          {/* Progress Section (for enrolled courses) */}
          {course.is_enrolled && course.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Tu progreso</span>
                <span className="font-bold text-primary">{Math.round(course.progress)}%</span>
              </div>
              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          )}

          {/* CTA Button */}
          <Button
            className={`w-full font-semibold transition-all duration-300 ${
              course.is_enrolled
                ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-primary/25"
                : "bg-transparent border-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {course.is_enrolled ? (
              <>
                <Award className="h-4 w-4 mr-2" />
                Continuar
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            ) : (
              <>
                Ver Detalles
                <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export const CourseCard = memo(CourseCardComponent);
