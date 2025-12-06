import { motion } from "framer-motion";
import { Trophy, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CourseProgressBarProps {
  progress: number;
  courseTitle: string;
  compact?: boolean;
}

export const CourseProgressBar = ({
  progress,
  courseTitle,
  compact = false,
}: CourseProgressBarProps) => {
  const navigate = useNavigate();
  const displayProgress = Math.min(Math.max(0, progress), 100);

  if (compact) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{courseTitle}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-bold text-primary shrink-0">
                {displayProgress}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        {/* Course Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{courseTitle}</h1>
        </div>

        {/* Progress Section */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-3 w-48">
            <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  displayProgress === 100
                    ? "bg-gradient-to-r from-success to-emerald-400"
                    : "bg-gradient-to-r from-primary to-primary-glow"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              displayProgress === 100 ? "text-success" : "text-primary"
            )}>
              {displayProgress}%
            </span>
          </div>

          {/* Achievement Icon */}
          <div className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full",
            displayProgress === 100
              ? "bg-success/20 text-success"
              : displayProgress >= 50
                ? "bg-primary/20 text-primary"
                : "bg-muted/50 text-muted-foreground"
          )}>
            {displayProgress === 100 ? (
              <Trophy className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="sm:hidden mt-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                displayProgress === 100
                  ? "bg-gradient-to-r from-success to-emerald-400"
                  : "bg-gradient-to-r from-primary to-primary-glow"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold",
            displayProgress === 100 ? "text-success" : "text-primary"
          )}>
            {displayProgress}%
          </span>
        </div>
      </div>
    </div>
  );
};
