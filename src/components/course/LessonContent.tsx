import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, Video, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayerStacked } from "@/components/common/VideoPlayerStacked";
import { LessonFooter } from "./LessonFooter";
import { LessonTabs } from "./LessonTabs";
import { cn } from "@/lib/utils";

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
  materials?: Array<{
    id: string;
    title: string;
    file_url: string;
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

// Loading Skeleton Component
const LessonSkeleton = () => (
  <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
    <div className="max-w-5xl mx-auto">
      {/* Video Skeleton */}
      <Skeleton className="w-full aspect-video rounded-2xl" />
      
      {/* Content Skeleton */}
      <div className="mt-6 space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

const LessonContentComponent = ({
  lesson,
  videos,
  materials = [],
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
  if (loading) {
    return <LessonSkeleton />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col min-h-0"
      >
        {/* Main Content - Single scroll container */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Lesson Header Section */}
          <header className="w-full px-4 md:px-6 lg:px-8 pt-4 md:pt-6 pb-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-4"
              >
                {/* Breadcrumb & Status */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1"
                  >
                    <BookOpen className="h-3 w-3 mr-1.5" />
                    {moduleName}
                  </Badge>
                  
                  {completed && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Completada
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-foreground">
                  {lesson.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
                  {instructorName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{instructorName}</span>
                    </div>
                  )}
                  {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{lesson.duration_minutes} minutos</span>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="text-sm">
                        {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </header>

          {/* Video Section - Stacked Videos */}
          <section className="w-full px-4 md:px-6 lg:px-8 pb-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <VideoPlayerStacked
                  videos={videos}
                  lessonId={lesson.id}
                  fallbackImage={lesson.image_url}
                />
              </motion.div>
            </div>
          </section>

          {/* Tabs Section: Summary, Resources, Notes */}
          <section className="w-full px-4 md:px-6 lg:px-8 pb-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <LessonTabs
                  lessonDescription={lesson.description}
                  materials={materials}
                  lessonId={lesson.id}
                />
              </motion.div>
            </div>
          </section>

          {/* Footer Navigation */}
          <footer className="w-full px-4 md:px-6 lg:px-8 pb-6 md:pb-8">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LessonFooter
                  completed={completed}
                  onComplete={onComplete}
                  onNextLesson={onNextLesson}
                  onPreviousLesson={onPreviousLesson}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                />
              </motion.div>
            </div>
          </footer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const LessonContent = memo(LessonContentComponent);
