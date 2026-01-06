import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCourseHub } from "@/hooks/useCourseHub";
import { CourseRoadmap } from "@/components/course/CourseRoadmap";
import ChatBot from "@/components/ChatBot";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    course,
    modules,
    stats,
    lastLessonId,
    isEnrolled,
    loading,
  } = useCourseHub(id, user?.id);

  const handleContinue = useCallback(() => {
    if (lastLessonId) {
      navigate(`/lesson/${lastLessonId}`);
    }
  }, [navigate, lastLessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Skeleton */}
        <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-40" />
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Curso no encontrado</h2>
          <Button onClick={() => navigate('/courses')}>
            Ver todos los cursos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-xl sticky top-0 z-40 bg-background/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a Cursos</span>
          </Button>
          
          {isEnrolled && stats.progress > 0 && (
            <Button
              onClick={handleContinue}
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
            >
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Continuar aprendiendo</span>
              <span className="sm:hidden">Continuar</span>
            </Button>
          )}
        </div>
      </nav>

      {/* Main Content - Course Roadmap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-6 md:py-8"
      >
        <CourseRoadmap
          courseTitle={course.title}
          courseDescription={course.description || undefined}
          modules={modules}
          stats={stats}
          enableProgressiveLocking={false}
        />
      </motion.div>

      <ChatBot />
    </div>
  );
};

export default CourseDetail;
