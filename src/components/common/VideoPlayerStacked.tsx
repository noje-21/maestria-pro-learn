import { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, Video, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoItem {
  id: string;
  video_url: string;
  title: string | null;
  order_number: number;
}

interface VideoPlayerStackedProps {
  videos: VideoItem[];
  lessonId: string;
  fallbackImage?: string | null;
  className?: string;
}

const SingleVideoPlayer = memo(({ 
  video, 
  index,
  isWatched,
  onWatched,
}: { 
  video: VideoItem; 
  index: number;
  isWatched: boolean;
  onWatched: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onWatched();
  }, [onWatched]);

  return (
    <motion.div
      ref={videoRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-3"
    >
      {/* Video Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shrink-0",
            isWatched 
              ? "bg-emerald-500 text-white" 
              : "bg-primary/10 text-primary"
          )}>
            {isWatched ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm">
              {video.title || `Video ${index + 1}`}
            </h4>
            {isWatched && (
              <span className="text-xs text-emerald-500">Visto</span>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          <Video className="h-3 w-3 mr-1" />
          Video {index + 1}
        </Badge>
      </div>

      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-border/30 bg-black">
        <div className="aspect-video relative">
          {/* Loading State */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-card/95 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Cargando video...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Iframe */}
          <iframe
            src={video.video_url}
            title={video.title || `Video ${index + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            onLoad={handleLoad}
          />
        </div>
      </div>
    </motion.div>
  );
});

SingleVideoPlayer.displayName = "SingleVideoPlayer";

const VideoPlayerStackedComponent = ({
  videos,
  lessonId,
  fallbackImage,
  className,
}: VideoPlayerStackedProps) => {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(true);

  // Reset watched state when lesson changes
  useEffect(() => {
    setWatchedVideos(new Set());
    setIsExpanded(true);
  }, [lessonId]);

  const handleVideoWatched = useCallback((videoId: string) => {
    setWatchedVideos(prev => new Set([...prev, videoId]));
  }, []);

  // No videos - show fallback
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

  const sortedVideos = [...videos].sort((a, b) => a.order_number - b.order_number);
  const watchedCount = watchedVideos.size;
  const totalVideos = sortedVideos.length;
  const hasMultipleVideos = totalVideos > 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with video count */}
      {hasMultipleVideos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {totalVideos} videos en esta lección
              </p>
              <p className="text-sm text-muted-foreground">
                {watchedCount} de {totalVideos} vistos
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-1.5">
              {sortedVideos.map((video) => (
                <div
                  key={video.id}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    watchedVideos.has(video.id)
                      ? "bg-emerald-500"
                      : "bg-muted"
                  )}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-1"
            >
              <span className="hidden sm:inline">
                {isExpanded ? "Colapsar" : "Expandir"}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                !isExpanded && "-rotate-90"
              )} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Videos List - Stacked Vertically */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {sortedVideos.map((video, index) => (
              <SingleVideoPlayer
                key={video.id}
                video={video}
                index={index}
                isWatched={watchedVideos.has(video.id)}
                onWatched={() => handleVideoWatched(video.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VideoPlayerStacked = memo(VideoPlayerStackedComponent);
