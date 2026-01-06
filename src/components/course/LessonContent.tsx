import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayerStacked } from "@/components/common/VideoPlayerStacked";
import { LessonFooter } from "./LessonFooter";
import { LessonTabs } from "./LessonTabs";

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
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col"
      >
        {/* Video Section - All videos stacked vertically */}
        <div className="w-full px-4 md:px-6 lg:px-8 pt-4 md:pt-6">
          <div className="max-w-5xl mx-auto">
            <VideoPlayerStacked
              videos={videos}
              lessonId={lesson.id}
              fallbackImage={lesson.image_url}
            />
          </div>
        </div>

        {/* Lesson Content Section */}
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Lesson Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Module Badge */}
              <Badge
                variant="secondary"
                className="mb-4 bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1"
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
                    <span className="text-sm">{videos.length} {videos.length === 1 ? 'video' : 'videos'}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Lesson Tabs: Summary, Resources, Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
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
        </div>

        {/* Footer Navigation */}
        <motion.div 
          className="w-full px-4 md:px-6 lg:px-8 pb-6 md:pb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="max-w-5xl mx-auto">
            <LessonFooter
              completed={completed}
              onComplete={onComplete}
              onNextLesson={onNextLesson}
              onPreviousLesson={onPreviousLesson}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const LessonContent = memo(LessonContentComponent);
