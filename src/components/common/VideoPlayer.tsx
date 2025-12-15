import { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

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

const VideoPlayerComponent = ({
  videos,
  lessonId,
  fallbackImage,
  className,
}: VideoPlayerProps) => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Reset when lesson changes
  useEffect(() => {
    setActiveVideoIndex(0);
    const newLoadingStates: Record<string, boolean> = {};
    videos.forEach(v => {
      newLoadingStates[v.id] = true;
    });
    setLoadingStates(newLoadingStates);
  }, [lessonId, videos]);

  const handleVideoLoad = useCallback((videoId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [videoId]: false
    }));
  }, []);

  // No videos available
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

  // Single video - simple case
  if (videos.length === 1) {
    const video = videos[0];
    const isLoading = loadingStates[video.id] !== false;
    
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30 bg-black">
          <div className="aspect-video relative">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 bg-card/90 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Cargando video...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <iframe
              key={`${lessonId}-${video.id}`}
              width="100%"
              height="100%"
              src={video.video_url}
              title={video.title || "Video de la lección"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0 absolute inset-0"
              onLoad={() => handleVideoLoad(video.id)}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  // Multiple videos - show one at a time with selector tabs
  const activeVideo = videos[activeVideoIndex];
  const isCurrentLoading = loadingStates[activeVideo?.id] !== false;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video count indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Video className="h-4 w-4" />
        <span>{videos.length} videos en esta lección</span>
      </div>

      {/* Main video player */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30 bg-black">
        <div className="aspect-video relative">
          <AnimatePresence>
            {isCurrentLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-card/90 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Cargando video...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.iframe
              key={`${lessonId}-${activeVideo.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              width="100%"
              height="100%"
              src={activeVideo.video_url}
              title={activeVideo.title || `Video ${activeVideoIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0 absolute inset-0"
              onLoad={() => handleVideoLoad(activeVideo.id)}
              loading="lazy"
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Video selector tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {videos.map((video, index) => (
          <motion.button
            key={video.id}
            onClick={() => setActiveVideoIndex(index)}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              "transition-all whitespace-nowrap border min-w-fit",
              index === activeVideoIndex
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary"
                : "bg-card/60 hover:bg-card text-muted-foreground border-border/50 hover:border-primary/30"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
              index === activeVideoIndex
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {index + 1}
            </span>
            <span className="truncate max-w-[150px]">
              {video.title || `Video ${index + 1}`}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export const VideoPlayer = memo(VideoPlayerComponent);
