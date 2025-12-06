import { motion } from "framer-motion";
import { 
  FileText, 
  Image, 
  Headphones, 
  File,
  ExternalLink,
  Download,
  Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  file_url: string;
  type?: 'pdf' | 'doc' | 'image' | 'audio' | 'video' | 'presentation';
  size?: string;
}

interface ResourcesSectionProps {
  resources: Resource[];
  title?: string;
  showPreview?: boolean;
}

const getResourceConfig = (url: string, title: string): { type: string; icon: any; color: string; label: string } => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const lowerTitle = title.toLowerCase();
  
  if (['pdf'].includes(extension) || lowerTitle.includes('pdf')) {
    return { type: 'pdf', icon: FileText, color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'PDF' };
  }
  if (['doc', 'docx'].includes(extension) || lowerTitle.includes('documento') || lowerTitle.includes('word')) {
    return { type: 'doc', icon: FileText, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'DOC' };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension) || lowerTitle.includes('imagen')) {
    return { type: 'image', icon: Image, color: 'bg-green-500/10 text-green-400 border-green-500/20', label: 'IMG' };
  }
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension) || lowerTitle.includes('audio')) {
    return { type: 'audio', icon: Headphones, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'AUDIO' };
  }
  if (['ppt', 'pptx'].includes(extension) || lowerTitle.includes('presentación')) {
    return { type: 'presentation', icon: File, color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', label: 'PPT' };
  }
  return { type: 'file', icon: File, color: 'bg-muted text-muted-foreground border-muted', label: 'FILE' };
};

export const ResourcesSection = ({
  resources,
  title = "Recursos de la lección",
  showPreview = true,
}: ResourcesSectionProps) => {
  if (resources.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/50 border-border/50">
        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">No hay recursos disponibles</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => {
          const config = getResourceConfig(resource.file_url, resource.title);
          const Icon = config.icon;

          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group relative overflow-hidden bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                {/* Preview Section (for images) */}
                {showPreview && config.type === 'image' && (
                  <div className="aspect-video bg-muted/20 overflow-hidden">
                    <img
                      src={resource.file_url}
                      alt={resource.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-xl border shrink-0",
                      config.color
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                        {resource.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                        {resource.size && (
                          <span className="text-xs text-muted-foreground">
                            {resource.size}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      asChild
                    >
                      <a 
                        href={resource.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a 
                        href={resource.file_url} 
                        download
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
