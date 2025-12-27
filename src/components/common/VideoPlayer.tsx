import { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, ChevronLeft, ChevronRight, Video, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Video {
  id: string;
  video_url: string;
  title: string | null;
  order_number: number;
}

interface VideoPlayerProps {
  videos: Video[];
  lessonId: string;
  fallbackImage?: string | null;
  className?: string;
}

// Single video player - only renders ONE video at a time
const VideoPlayerComponent = ({
  videos,
  lessonId,
  fallbackImage,
  className,
}: VideoPlayerProps) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set([0]));
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset when lesson changes - critical to prevent video overlap
  useEffect(() => {
    setActiveVideoIndex(0);
    setIsLoading(true);
    setWatchedVideos(new Set([0]));
  }, [lessonId]);

  const handleVideoLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleVideoChange = useCallback((index: number) => {
    if (index === activeVideoIndex) return;
    setIsLoading(true);
    setActiveVideoIndex(index);
    setWatchedVideos(prev => new Set([...prev, index]));
  }, [activeVideoIndex]);

  const goToNextVideo = useCallback(() => {
    if (activeVideoIndex < videos.length - 1) {
      handleVideoChange(activeVideoIndex + 1);
    }
  }, [activeVideoIndex, videos.length, handleVideoChange]);

  const goToPrevVideo = useCallback(() => {
    if (activeVideoIndex > 0) {
      handleVideoChange(activeVideoIndex - 1);
    }
  }, [activeVideoIndex, handleVideoChange]);

  // No videos available - show fallback
  if (!videos.length) {
    if (fallbackImage) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30",
            className
          )}
        >
          <div className="aspect-video">
            <img
              src={fallbackImage}
              alt="Contenido de la lección"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "aspect-video bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-2xl flex items-center justify-center ring-1 ring-border/30",
          className
        )}
      >
        <div className="text-center">
          <Play className="h-16 w-16 text-primary/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Contenido de la lección</p>
        </div>
      </motion.div>
    );
  }

  const activeVideo = videos[activeVideoIndex];
  const hasMultipleVideos = videos.length > 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video count indicator - only for multiple videos */}
      {hasMultipleVideos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4" />
            <span>
              Video {activeVideoIndex + 1} de {videos.length}
            </span>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevVideo}
              disabled={activeVideoIndex === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextVideo}
              disabled={activeVideoIndex === videos.length - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main video player - ONLY ONE iframe at a time */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30 bg-black">
        <div className="aspect-video relative">
          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Cargando video...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Single iframe - keyed by lessonId AND videoId to force remount */}
          <iframe
            ref={iframeRef}
            key={`${lessonId}-${activeVideo.id}`}
            width="100%"
            height="100%"
            src={activeVideo.video_url}
            title={activeVideo.title || `Video ${activeVideoIndex + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0 absolute inset-0"
            onLoad={handleVideoLoad}
          />
        </div>
      </div>

      {/* Video title for current video */}
      {activeVideo.title && (
        <motion.p
          key={activeVideo.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-center text-muted-foreground"
        >
          {activeVideo.title}
        </motion.p>
      )}

      {/* Video selector tabs - horizontal scroll for many videos */}
      {hasMultipleVideos && (
        <ScrollArea className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 pb-2"
          >
            {videos.map((video, index) => {
              const isActive = index === activeVideoIndex;
              const isWatched = watchedVideos.has(index);
              
              return (
                <motion.button
                  key={video.id}
                  onClick={() => handleVideoChange(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                    "transition-all whitespace-nowrap border min-w-fit",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary"
                      : isWatched
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-card/60 hover:bg-card text-muted-foreground border-border/50 hover:border-primary/30"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : isWatched
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {isWatched && !isActive ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="truncate max-w-[120px]">
                    {video.title || `Video ${index + 1}`}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
};

export const VideoPlayer = memo(VideoPlayerComponent);
