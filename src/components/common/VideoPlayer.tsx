import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(true);

  // Reset video index when lesson changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setIsLoading(true);
  }, [lessonId]);

  const activeVideo = videos[activeVideoIndex];

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Video Player Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/30 bg-black">
        <div className="aspect-video relative">
          {/* Loading State */}
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

          {/* Single iframe - only the active video */}
          <AnimatePresence mode="wait">
            <motion.iframe
              key={`${lessonId}-${activeVideo.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              width="100%"
              height="100%"
              src={activeVideo.video_url}
              title={activeVideo.title || `Video ${activeVideoIndex + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0 absolute inset-0"
              onLoad={handleIframeLoad}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Video Selector (only if multiple videos) */}
      {videos.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {videos.map((video, index) => (
            <motion.button
              key={video.id}
              onClick={() => {
                if (index !== activeVideoIndex) {
                  setIsLoading(true);
                  setActiveVideoIndex(index);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                "transition-all whitespace-nowrap border",
                index === activeVideoIndex
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary"
                  : "bg-card/50 hover:bg-card text-muted-foreground border-border/50 hover:border-primary/30"
              )}
            >
              <Play className="h-3.5 w-3.5" />
              {video.title || `Video ${index + 1}`}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const VideoPlayer = memo(VideoPlayerComponent);
