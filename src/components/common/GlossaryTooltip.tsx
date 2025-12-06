import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GlossaryTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export const GlossaryTooltip = ({
  term,
  definition,
  children,
}: GlossaryTooltipProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs p-4 bg-card/95 backdrop-blur-xl border-primary/20"
          sideOffset={8}
        >
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <h4 className="font-semibold text-primary">{term}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {definition}
            </p>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Inline version for use within text
interface GlossaryTermProps {
  term: string;
  definition: string;
}

export const GlossaryTerm = ({ term, definition }: GlossaryTermProps) => {
  return (
    <GlossaryTooltip term={term} definition={definition}>
      <span className="border-b border-dashed border-primary/50 text-primary cursor-help hover:border-primary transition-colors">
        {term}
      </span>
    </GlossaryTooltip>
  );
};
