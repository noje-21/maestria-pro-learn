import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export const CourseSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="overflow-hidden border-border/30 bg-card/50 backdrop-blur-sm h-full">
            {/* Image Skeleton */}
            <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted/30 relative overflow-hidden">
              <div className="absolute inset-0 shimmer" />
            </div>

            {/* Content Skeleton */}
            <div className="p-5 space-y-4">
              {/* Badge */}
              <div className="h-6 w-20 bg-muted/40 rounded-full animate-pulse" />
              
              {/* Title */}
              <div className="space-y-2">
                <div className="h-5 bg-muted/40 rounded w-full animate-pulse" />
                <div className="h-5 bg-muted/40 rounded w-2/3 animate-pulse" />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <div className="h-3 bg-muted/30 rounded w-full animate-pulse" />
                <div className="h-3 bg-muted/30 rounded w-4/5 animate-pulse" />
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2">
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
              </div>

              {/* Button */}
              <div className="h-10 bg-muted/40 rounded-lg animate-pulse" />
            </div>
          </Card>
        </motion.div>
      ))}
    </>
  );
};

// Add shimmer animation to index.css
