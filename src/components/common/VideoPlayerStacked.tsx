import { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle2, Video, Eye, EyeOff, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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

type VideoStatus = 'pending' | 'loading' | 'playing' | 'watched';

interface VideoState {
  status: VideoStatus;
  isVisible: boolean;
}

// Single Video Component with Lazy Loading
const SingleVideoPlayer = memo(({ 
  video, 
  index,
  totalVideos,
  videoState,
  onStatusChange,
  onInView,
}: { 
  video: VideoItem; 
  index: number;
  totalVideos: number;
  videoState: VideoState;
  onStatusChange: (status: VideoStatus) => void;
  onInView: (inView: boolean) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        onInView(entry.isIntersecting);
        // Load video when it's about to come into view (with margin)
        if (entry.isIntersecting && !shouldLoad) {
          setShouldLoad(true);
        }
      },
      { 
        rootMargin: '200px 0px', // Load 200px before coming into view
        threshold: 0.1 
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [onInView, shouldLoad]);

  const handleLoad = useCallback(() => {
    onStatusChange('playing');
    // Mark as watched after a short delay
    setTimeout(() => onStatusChange('watched'), 1000);
  }, [onStatusChange]);

  const getStatusBadge = () => {
    switch (videoState.status) {
      case 'watched':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Visto
          </Badge>
        );
      case 'playing':
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Eye className="h-3 w-3" />
            Reproduciendo
          </Badge>
        );
      case 'loading':
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Cargando
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <EyeOff className="h-3 w-3" />
            No visto
          </Badge>
        );
    }
  };

  return (
    <motion.article
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: Math.min(index * 0.1, 0.3), 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="relative scroll-mt-4"
    >
      {/* Video Card */}
      <div className={cn(
        "rounded-2xl overflow-hidden bg-card border transition-all duration-300",
        videoState.status === 'watched' 
          ? "border-emerald-500/30 shadow-emerald-500/5 shadow-lg" 
          : videoState.status === 'playing'
          ? "border-primary/40 shadow-primary/10 shadow-xl ring-2 ring-primary/20"
          : "border-border/50 hover:border-border"
      )}>
        {/* Video Header */}
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border/30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Video Number Indicator */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold shrink-0 transition-colors",
              videoState.status === 'watched' 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                : videoState.status === 'playing'
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                : "bg-primary/10 text-primary"
            )}>
              {videoState.status === 'watched' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {/* Video Title & Meta */}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {video.title || `Video ${index + 1}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                Video {index + 1} de {totalVideos}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Video Player Container - Fixed aspect ratio to prevent layout shift */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
          <div className="absolute inset-0 bg-black">
            {/* Loading Skeleton - Show until video loads */}
            <AnimatePresence>
              {(!shouldLoad || videoState.status === 'loading' || videoState.status === 'pending') && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10 bg-muted/90 backdrop-blur-sm flex flex-col items-center justify-center"
                >
                  {shouldLoad ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
                      <p className="text-sm text-muted-foreground">Cargando video...</p>
                    </>
                  ) : (
                    <>
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <Play className="h-8 w-8 text-primary ml-1" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Video {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Se cargará al hacer scroll
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actual Video Iframe - Only render when should load */}
            {shouldLoad && (
              <iframe
                src={video.video_url}
                title={video.title || `Video ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
                onLoad={handleLoad}
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

SingleVideoPlayer.displayName = "SingleVideoPlayer";

// Main Stacked Video Player Component
const VideoPlayerStackedComponent = ({
  videos,
  lessonId,
  fallbackImage,
  className,
}: VideoPlayerStackedProps) => {
  const [videoStates, setVideoStates] = useState<Map<string, VideoState>>(new Map());

  // Reset states when lesson changes
  useEffect(() => {
    const initialStates = new Map<string, VideoState>();
    videos.forEach(video => {
      initialStates.set(video.id, { status: 'pending', isVisible: false });
    });
    setVideoStates(initialStates);
  }, [lessonId, videos]);

  const handleStatusChange = useCallback((videoId: string, status: VideoStatus) => {
    setVideoStates(prev => {
      const newStates = new Map(prev);
      const current = newStates.get(videoId) || { status: 'pending', isVisible: false };
      newStates.set(videoId, { ...current, status });
      return newStates;
    });
  }, []);

  const handleInView = useCallback((videoId: string, inView: boolean) => {
    setVideoStates(prev => {
      const newStates = new Map(prev);
      const current = newStates.get(videoId) || { status: 'pending', isVisible: false };
      if (current.status === 'pending' && inView) {
        newStates.set(videoId, { ...current, status: 'loading', isVisible: inView });
      } else {
        newStates.set(videoId, { ...current, isVisible: inView });
      }
      return newStates;
    });
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
  const watchedCount = Array.from(videoStates.values()).filter(s => s.status === 'watched').length;
  const totalVideos = sortedVideos.length;
  const progressPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Progress - Only show for multiple videos */}
      {totalVideos > 1 && (
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 p-4 rounded-xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  Videos de la lección
                </h2>
                <p className="text-sm text-muted-foreground">
                  {watchedCount} de {totalVideos} completados
                </p>
              </div>
            </div>
            
            {/* Mini Progress Dots */}
            <div className="hidden sm:flex items-center gap-1.5">
              {sortedVideos.map((video) => {
                const state = videoStates.get(video.id);
                return (
                  <motion.div
                    key={video.id}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      state?.status === 'watched'
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                        : state?.status === 'playing'
                        ? "bg-primary animate-pulse"
                        : "bg-muted"
                    )}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1 h-2" />
            <span className={cn(
              "text-sm font-bold tabular-nums",
              progressPercent === 100 ? "text-emerald-500" : "text-primary"
            )}>
              {progressPercent}%
            </span>
          </div>
        </motion.header>
      )}

      {/* Videos List - Clean Vertical Stack */}
      <div className="space-y-6">
        {sortedVideos.map((video, index) => (
          <SingleVideoPlayer
            key={video.id}
            video={video}
            index={index}
            totalVideos={totalVideos}
            videoState={videoStates.get(video.id) || { status: 'pending', isVisible: false }}
            onStatusChange={(status) => handleStatusChange(video.id, status)}
            onInView={(inView) => handleInView(video.id, inView)}
          />
        ))}
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {watchedCount === totalVideos && totalVideos > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-600">
              ¡Todos los videos completados!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Has visto todos los videos de esta lección
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const VideoPlayerStacked = memo(VideoPlayerStackedComponent);
