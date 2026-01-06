import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, Video, Target, CheckCircle2, Footprints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { VideoPlayerStacked } from "@/components/common/VideoPlayerStacked";
import { LessonFooter } from "./LessonFooter";
import { LessonTabs } from "./LessonTabs";
import { LessonCompletedSummary } from "./LessonCompletedSummary";
import { cn } from "@/lib/utils";
import { getHumanProgressMessage, getStepDescription } from "@/utils/progressMessages";
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
  moduleNumber?: number;
  lessonNumber?: number;
  totalLessonsInModule?: number;
  moduleProgress?: number;
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
      {/* Header Skeleton */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-8 w-48 rounded-full" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      
      {/* Video Skeleton */}
      <Skeleton className="w-full aspect-video rounded-2xl" />
      
      {/* Content Skeleton */}
      <div className="mt-6 space-y-4">
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
  moduleNumber = 1,
  lessonNumber = 1,
  totalLessonsInModule = 1,
  moduleProgress = 0,
  instructorName,
  completed,
  onComplete,
  onNextLesson,
  onPreviousLesson,
  hasNext,
  hasPrevious,
  loading = false,
}: LessonContentProps) => {
  const [showCompletedSummary, setShowCompletedSummary] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);

  // Detect when lesson becomes completed to show summary
  useEffect(() => {
    if (completed && !wasCompleted) {
      setShowCompletedSummary(true);
      setWasCompleted(true);
    }
  }, [completed, wasCompleted]);

  // Reset when lesson changes
  useEffect(() => {
    setShowCompletedSummary(false);
    setWasCompleted(completed);
  }, [lesson.id]);

  if (loading) {
    return <LessonSkeleton />;
  }

  // Human-friendly step description
  const stepDescription = getStepDescription(lessonNumber, totalLessonsInModule);
  const humanProgress = getHumanProgressMessage(moduleProgress);
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
          {/* Module Progress Header - Sticky on scroll */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/30">
            <div className="w-full px-4 md:px-6 lg:px-8 py-3">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Module Info */}
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 font-medium px-3 py-1.5 gap-1.5"
                    >
                      <Target className="h-3.5 w-3.5" />
                      Hito {moduleNumber}
                    </Badge>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {moduleName}
                    </span>
                  </div>
                  
                  {/* Module Progress */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Footprints className="h-4 w-4" />
                      <span>
                        Paso {lessonNumber} de {totalLessonsInModule}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 w-24">
                      <Progress 
                        value={moduleProgress} 
                        className={cn(
                          "h-2 flex-1",
                          moduleProgress >= 100 && "[&>div]:bg-emerald-500"
                        )}
                      />
                      <span className={cn(
                        "text-xs font-semibold tabular-nums",
                        moduleProgress >= 100 ? "text-emerald-500" : "text-primary"
                      )}>
                        {Math.round(moduleProgress)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Header Section */}
          <header className="w-full px-4 md:px-6 lg:px-8 pt-6 pb-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-4"
              >
                {/* Step Indicator & Status */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-secondary/50 font-medium px-3 py-1"
                  >
                    {stepDescription}
                  </Badge>
                  
                  {completed && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      Paso completado
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
                      <span className="text-sm">~{lesson.duration_minutes} minutos</span>
                    </div>
                  )}
                  {videos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="text-sm">
                        {videos.length} {videos.length === 1 ? 'recurso multimedia' : 'recursos multimedia'}
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

          {/* Lesson Completed Summary */}
          {showCompletedSummary && (
            <section className="w-full px-4 md:px-6 lg:px-8 pb-4">
              <div className="max-w-5xl mx-auto">
                <LessonCompletedSummary
                  isVisible={showCompletedSummary}
                  lessonTitle={lesson.title}
                  moduleName={moduleName}
                  lessonNumber={lessonNumber}
                  totalLessonsInModule={totalLessonsInModule}
                  moduleProgress={moduleProgress}
                  hasNextLesson={hasNext}
                  onNextLesson={onNextLesson}
                  onDismiss={() => setShowCompletedSummary(false)}
                />
              </div>
            </section>
          )}

          {/* Footer Navigation */}
          <footer className="w-full px-4 md:px-6 lg:px-8 pb-6 md:pb-8">
            <div className="max-w-5xl mx-auto space-y-4">
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
