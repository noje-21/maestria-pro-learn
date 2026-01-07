import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClinicalCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "success" | "progress" | "locked";
  progress?: number;
  children: React.ReactNode;
}

const ClinicalCard = React.forwardRef<HTMLDivElement, ClinicalCardProps>(
  ({ className, variant = "default", progress, children, ...props }, ref) => {
    const getLineStyles = () => {
      switch (variant) {
        case "success":
          return "before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-400";
        case "progress":
          return "before:bg-gradient-to-b before:from-primary before:via-primary before:to-muted";
        case "locked":
          return "before:bg-muted/50 before:opacity-50";
        default:
          return "before:bg-gradient-to-b before:from-primary before:to-primary/70";
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl border border-border bg-card p-6",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
          "before:transition-all before:duration-300",
          "hover:border-primary/30 hover:before:shadow-[0_0_8px_hsl(225_65%_52%_/_0.4)]",
          "transition-all duration-300",
          getLineStyles(),
          className
        )}
        style={
          variant === "progress" && progress !== undefined
            ? { "--progress-value": `${progress}%` } as React.CSSProperties
            : undefined
        }
        whileHover={{ y: -2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

ClinicalCard.displayName = "ClinicalCard";

// Header con marcador de milestone
const ClinicalCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { step?: number | string }
>(({ className, step, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-start gap-4 mb-4", className)}
    {...props}
  >
    {step && (
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">{step}</span>
      </div>
    )}
    <div className="flex-1 min-w-0">{children}</div>
  </div>
));

ClinicalCardHeader.displayName = "ClinicalCardHeader";

const ClinicalCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));

ClinicalCardTitle.displayName = "ClinicalCardTitle";

const ClinicalCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1.5 leading-relaxed", className)}
    {...props}
  />
));

ClinicalCardDescription.displayName = "ClinicalCardDescription";

const ClinicalCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));

ClinicalCardContent.displayName = "ClinicalCardContent";

const ClinicalCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 mt-4 pt-4 border-t border-border/50", className)}
    {...props}
  />
));

ClinicalCardFooter.displayName = "ClinicalCardFooter";

export {
  ClinicalCard,
  ClinicalCardHeader,
  ClinicalCardTitle,
  ClinicalCardDescription,
  ClinicalCardContent,
  ClinicalCardFooter,
};
