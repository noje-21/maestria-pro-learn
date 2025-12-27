import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Image, 
  Headphones, 
  ExternalLink,
  BookOpen,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Cloud,
  ListCollapse,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Material {
  id: string;
  title: string;
  file_url: string;
  type?: string;
}

interface LessonTabsProps {
  lessonDescription: string;
  materials: Material[];
  lessonId: string;
}

// Helper functions for file types
const getFileType = (url: string, title: string): string => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const lowerTitle = title.toLowerCase();
  
  if (['pdf'].includes(extension) || lowerTitle.includes('pdf')) return 'pdf';
  if (['doc', 'docx'].includes(extension) || lowerTitle.includes('documento')) return 'doc';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || lowerTitle.includes('imagen')) return 'image';
  if (['mp3', 'wav', 'ogg'].includes(extension) || lowerTitle.includes('audio')) return 'audio';
  return 'file';
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
    case 'doc':
      return FileText;
    case 'image':
      return Image;
    case 'audio':
      return Headphones;
    default:
      return FileText;
  }
};

const getFileColor = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'text-red-400 bg-red-500/10';
    case 'doc':
      return 'text-blue-400 bg-blue-500/10';
    case 'image':
      return 'text-green-400 bg-green-500/10';
    case 'audio':
      return 'text-purple-400 bg-purple-500/10';
    default:
      return 'text-muted-foreground bg-muted/50';
  }
};

const LessonTabsComponent = ({
  lessonDescription,
  materials,
  lessonId,
}: LessonTabsProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [noteContent, setNoteContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Load notes from Supabase
  useEffect(() => {
    const loadNote = async () => {
      if (!user || !lessonId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("lesson_notes")
          .select("id, content")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setNoteContent(data.content);
          setNoteId(data.id);
        } else {
          setNoteContent("");
          setNoteId(null);
        }
      } catch (error) {
        console.error("Error loading note:", error);
        const storedNote = localStorage.getItem(`lesson-note-${lessonId}`);
        if (storedNote) {
          setNoteContent(storedNote);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [user, lessonId]);

  // Debounced save function
  const saveNote = useCallback(async (content: string) => {
    if (!user || !lessonId) return;
    
    setSaveStatus('saving');
    setIsSaving(true);

    try {
      localStorage.setItem(`lesson-note-${lessonId}`, content);

      if (noteId) {
        const { error } = await supabase
          .from("lesson_notes")
          .update({ content })
          .eq("id", noteId);

        if (error) throw error;
      } else if (content.trim()) {
        const { data, error } = await supabase
          .from("lesson_notes")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            content
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data) setNoteId(data.id);
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving note:", error);
      setSaveStatus('idle');
      toast({
        title: "Error al guardar",
        description: "La nota se guardó localmente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, lessonId, noteId, toast]);

  // Debounce effect for auto-save
  useEffect(() => {
    if (isLoading) return;
    
    const timeoutId = setTimeout(() => {
      saveNote(noteContent);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [noteContent, saveNote, isLoading]);

  const deleteNote = async () => {
    if (!user || !noteId) return;

    try {
      const { error } = await supabase
        .from("lesson_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNoteContent("");
      setNoteId(null);
      localStorage.removeItem(`lesson-note-${lessonId}`);

      toast({
        title: "Nota eliminada",
        description: "La nota se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-12 bg-muted/30 rounded-none border-b border-border/50">
          <TabsTrigger 
            value="summary" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <ListCollapse className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Recursos</span>
            {materials.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {materials.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Notas</span>
            {noteContent.trim() && (
              <div className="w-2 h-2 rounded-full bg-primary ml-1" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="m-0 p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-5">
              {lessonDescription ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Descripción de la lección
                  </h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {lessonDescription}
                  </p>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No hay descripción disponible para esta lección.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="m-0 p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-5 space-y-3">
              {materials.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No hay materiales disponibles para esta lección.
                  </p>
                </div>
              ) : (
                materials.map((material, index) => {
                  const fileType = getFileType(material.file_url, material.title);
                  const Icon = getFileIcon(fileType);
                  const colorClass = getFileColor(fileType);

                  return (
                    <motion.a
                      key={material.id}
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-background border border-border/50 hover:border-primary/30 transition-all group"
                    >
                      <div className={cn("p-2.5 rounded-lg", colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {material.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {fileType === 'pdf' ? 'Documento PDF' : 
                           fileType === 'doc' ? 'Documento Word' :
                           fileType === 'image' ? 'Imagen' :
                           fileType === 'audio' ? 'Audio' : 'Archivo'}
                        </p>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </motion.a>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="m-0 p-0">
          <ScrollArea className="max-h-[300px]">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Mis notas
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {saveStatus === 'saving' && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">Guardado</span>
                    </>
                  )}
                  {saveStatus === 'idle' && noteId && (
                    <>
                      <Cloud className="h-3 w-3" />
                      <span>Sincronizado</span>
                    </>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-muted-foreground">Cargando notas...</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="Escribe tus notas aquí... Se guardan automáticamente."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="min-h-[150px] bg-background/50 resize-none"
                  />
                  
                  {noteContent.trim() && (
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={deleteNote}
                        className="gap-1"
                        disabled={isSaving}
                      >
                        <Trash2 className="h-3 w-3" />
                        Eliminar nota
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Tus notas se guardan automáticamente y se sincronizan entre dispositivos.
                  </p>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export const LessonTabs = memo(LessonTabsComponent);
