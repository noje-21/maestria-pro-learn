import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, User, Play } from "lucide-react";
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
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  // Reset active video when lesson changes
  useEffect(() => {
    setActiveVideoIndex(0);
  }, [lesson.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="w-full aspect-video rounded-2xl bg-muted/50 flex items-center justify-center">
            <Play className="h-16 w-16 text-muted-foreground/30" />
          </div>
        </div>
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col min-h-full"
      >
        {/* Video Section - Fixed aspect ratio, no sticky behavior */}
        <div className="w-full px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
          <div className="max-w-4xl mx-auto">
            {videos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Main Video Player */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30 bg-black">
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={videos[activeVideoIndex]?.video_url}
                      title={videos[activeVideoIndex]?.title || `Video ${activeVideoIndex + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0"
                    />
                  </div>
                </div>

                {/* Video Selector (if multiple videos) */}
                {videos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {videos.map((video, index) => (
                      <button
                        key={video.id}
                        onClick={() => setActiveVideoIndex(index)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-all whitespace-nowrap
                          ${index === activeVideoIndex 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                          }
                        `}
                      >
                        <Play className="h-3.5 w-3.5" />
                        {video.title || `Video ${index + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : lesson.image_url ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30"
              >
                <div className="aspect-video">
                  <img
                    src={lesson.image_url}
                    alt={lesson.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-video bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-2xl flex items-center justify-center ring-1 ring-border/30"
              >
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-primary/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Contenido de la lección</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Lesson Content Section */}
        <div className="flex-1 w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Lesson Header */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Module Badge */}
              <Badge 
                variant="secondary" 
                className="mb-4 bg-primary/10 text-primary border-primary/20 font-medium"
              >
                {moduleName}
              </Badge>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-foreground">
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
            {lesson.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-5 md:p-6 bg-card/80 backdrop-blur-sm border-border/50">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Descripción
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {lesson.description}
                  </p>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full px-4 md:px-6 lg:px-8 pb-4 md:pb-6">
          <div className="max-w-4xl mx-auto">
            <LessonFooter
              completed={completed}
              onComplete={onComplete}
              onNextLesson={onNextLesson}
              onPreviousLesson={onPreviousLesson}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
