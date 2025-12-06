import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonFooter } from "./LessonFooter";

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    description: string;
    duration_minutes?: number;
    image_url?: string | null;
  };
  videos: Array<{
    id: string;
    video_url: string;
    title: string | null;
    order_number: number;
  }>;
  moduleName: string;
  instructorName?: string;
  completed: boolean;
  onComplete: () => void;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  loading?: boolean;
}

export const LessonContent = ({
  lesson,
  videos,
  moduleName,
  instructorName,
  completed,
  onComplete,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
  loading = false,
}: LessonContentProps) => {
  const [isVideoSticky, setIsVideoSticky] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sticky video on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (videoContainerRef.current && contentRef.current) {
        const videoRect = videoContainerRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        // Make video sticky when scrolling past it, but not past content
        setIsVideoSticky(
          videoRect.top < 100 && 
          contentRect.bottom > window.innerHeight
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto"
        ref={contentRef}
      >
        {/* Video Section */}
        <div 
          ref={videoContainerRef}
          className={`transition-all duration-300 ${
            isVideoSticky 
              ? "fixed top-20 right-4 w-80 z-40 shadow-2xl rounded-xl overflow-hidden"
              : "mb-8"
          }`}
        >
          {videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="aspect-video bg-card rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/50">
                    <iframe
                      width="100%"
                      height="100%"
                      src={video.video_url}
                      title={video.title || `Video ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                  {video.title && !isVideoSticky && (
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      {video.title}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : lesson.image_url ? (
            <div className="aspect-video bg-card rounded-2xl overflow-hidden shadow-xl ring-1 ring-border/50">
              <img
                src={lesson.image_url}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-primary/40" />
            </div>
          )}
        </div>

        {/* Lesson Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Module Badge */}
          <Badge 
            variant="secondary" 
            className="mb-4 bg-primary/10 text-primary border-primary/20"
          >
            {moduleName}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {lesson.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            {instructorName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{instructorName}</span>
              </div>
            )}
            {lesson.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{lesson.duration_minutes} minutos</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Descripción
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {lesson.description || "Esta lección te proporcionará conocimientos fundamentales para tu aprendizaje."}
            </p>
          </Card>
        </motion.div>

        {/* Spacer for sticky video */}
        {isVideoSticky && <div className="h-56" />}

        {/* Footer Navigation */}
        <LessonFooter
          completed={completed}
          onComplete={onComplete}
          onNextLesson={onNextLesson}
          onPreviousLesson={onPreviousLesson}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
        />
      </motion.div>
    </AnimatePresence>
  );
};
