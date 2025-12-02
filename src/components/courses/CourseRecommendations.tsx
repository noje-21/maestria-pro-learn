import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
  limit = 4 
}: CourseRecommendationsProps) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId, currentCourseId]);

  const loadRecommendations = async () => {
    try {
      // Get user's enrolled courses to understand their preferences
      const { data: enrolledCourses } = await supabase
        .from('user_courses')
        .select('course_id, courses(level)')
        .eq('user_id', userId)
        .eq('status', 'enrolled');

      const enrolledIds = enrolledCourses?.map((e: any) => e.course_id) || [];
      const userLevels: string[] = [...new Set(enrolledCourses?.map((e: any) => e.courses?.level).filter((l: unknown): l is string => typeof l === 'string'))];

      // Get all active courses
      let query = supabase
        .from('courses')
        .select('id, title, description, image_url, level')
        .eq('is_active', true)
        .eq('status', 'active')
        .limit(limit + enrolledIds.length + 1);

      const { data: coursesData, error } = await query;

      if (error) throw error;

      // Filter out already enrolled courses and current course
      let availableCourses = (coursesData || []).filter(
        (c) => !enrolledIds.includes(c.id) && c.id !== currentCourseId
      );

      // Score and sort courses based on user preferences
      const scoredCourses = availableCourses.map((course) => {
        let score = 0;
        let reason = "Curso popular";

        // Boost if same level as user's courses
        if (userLevels.includes(course.level)) {
          score += 10;
          reason = `Mismo nivel que tus cursos: ${course.level}`;
        }

        // Recommend next level if user has completed basics
        if (userLevels.includes('básico') && course.level === 'medio') {
          score += 15;
          reason = "Siguiente nivel recomendado";
        }
        if (userLevels.includes('medio') && course.level === 'avanzado') {
          score += 15;
          reason = "Siguiente nivel recomendado";
        }
        if (userLevels.includes('avanzado') && course.level === 'maestría') {
          score += 15;
          reason = "Programa de especialización";
        }

        // Default reason for new users
        if (enrolledIds.length === 0) {
          reason = "Recomendado para empezar";
        }

        return { ...course, score, reason };
      });

      // Sort by score and take top N
      scoredCourses.sort((a, b) => b.score - a.score);
      setRecommendations(scoredCourses.slice(0, limit));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(limit)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="aspect-video bg-muted rounded mb-3" />
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Recomendados para ti</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className="group cursor-pointer overflow-hidden border-border hover:border-primary/50 transition-all h-full"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 relative overflow-hidden">
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-10 w-10 text-primary/40" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={`${getLevelColor(course.level)} text-xs`}>
                    {course.level}
                  </Badge>
                </div>

                <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h4>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{course.reason}</span>
                </div>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full text-primary hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/course/${course.id}`);
                  }}
                >
                  Ver curso
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
