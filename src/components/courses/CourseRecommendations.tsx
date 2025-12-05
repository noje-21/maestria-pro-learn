import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  level: string;
  reason: string;
}

interface CourseRecommendationsProps {
  userId: string;
  currentCourseId?: string;
  limit?: number;
}

export const CourseRecommendations = ({ 
  userId, 
  currentCourseId,
  limit = 6 
}: CourseRecommendationsProps) => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId, currentCourseId]);

  const loadRecommendations = async () => {
    try {
      const { data: enrolledCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(level)')
        .eq('user_id', userId)
        .eq('status', 'enrolled');

      const enrolledIds = enrolledCourses?.map((e: any) => e.course_id) || [];
      const userLevels: string[] = [...new Set(enrolledCourses?.map((e: any) => e.courses?.level).filter((l: unknown): l is string => typeof l === 'string'))];

      let query = supabase
        .from('courses')
        .select('id, title, description, image_url, level')
        .eq('is_active', true)
        .eq('status', 'active')
        .limit(limit + enrolledIds.length + 1);

      const { data: coursesData, error } = await query;

      if (error) throw error;

      let availableCourses = (coursesData || []).filter(
        (c) => !enrolledIds.includes(c.id) && c.id !== currentCourseId
      );

      const scoredCourses = availableCourses.map((course) => {
        let score = 0;
        let reason = "Curso popular";

        if (userLevels.includes(course.level)) {
          score += 10;
          reason = `Mismo nivel: ${course.level}`;
        }

        if (userLevels.includes('básico') && course.level === 'medio') {
          score += 15;
          reason = "Siguiente nivel";
        }
        if (userLevels.includes('medio') && course.level === 'avanzado') {
          score += 15;
          reason = "Siguiente nivel";
        }
        if (userLevels.includes('avanzado') && course.level === 'maestría') {
          score += 15;
          reason = "Especialización";
        }

        if (enrolledIds.length === 0) {
          reason = "Para empezar";
        }

        return { ...course, score, reason };
      });

      scoredCourses.sort((a, b) => b.score - a.score);
      setRecommendations(scoredCourses.slice(0, limit));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelConfig = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: '🌱' };
      case 'medio':
        return { bg: 'bg-sky-500/20', text: 'text-sky-400', icon: '📚' };
      case 'avanzado':
        return { bg: 'bg-violet-500/20', text: 'text-violet-400', icon: '🚀' };
      case 'maestría':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: '👑' };
      default:
        return { bg: 'bg-muted/20', text: 'text-muted-foreground', icon: '📖' };
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72">
              <div className="aspect-video bg-muted/30 rounded-xl animate-pulse mb-3" />
              <div className="h-4 bg-muted/30 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-muted/30 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Recomendados para ti</h3>
            <p className="text-xs text-muted-foreground">Basado en tu progreso</p>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-9 w-9 rounded-full border-border/50 disabled:opacity-30 hover:bg-primary/10 hover:border-primary transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-9 w-9 rounded-full border-border/50 disabled:opacity-30 hover:bg-primary/10 hover:border-primary transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative -mx-4 px-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar pb-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {recommendations.map((course, idx) => {
            const levelConfig = getLevelConfig(course.level);
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 w-72 snap-start"
              >
                <Card
                  className="group cursor-pointer overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 h-full"
                  onClick={() => navigate(`/course/${course.id}`)}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-80" />
                    
                    {/* Level Badge */}
                    <Badge className={`absolute top-3 left-3 ${levelConfig.bg} ${levelConfig.text} border-0 text-[10px] font-semibold`}>
                      <span className="mr-1">{levelConfig.icon}</span>
                      {course.level}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {course.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-primary/70" />
                      <span className="font-medium">{course.reason}</span>
                    </div>

                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full text-primary hover:text-primary hover:bg-primary/10 font-medium text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.id}`);
                      }}
                    >
                      Ver curso
                      <ArrowRight className="h-3 w-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
