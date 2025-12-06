import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Image, 
  Headphones, 
  Download, 
  ExternalLink,
  BookOpen,
  Pencil,
  Save,
  Trash2,
  Plus,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";

interface Material {
  id: string;
  title: string;
  file_url: string;
  type?: string;
}

interface LessonSidePanelProps {
  materials: Material[];
  lessonId: string;
}

// Medical terms glossary (sample)
const glossaryTerms = [
  { term: "Hipertensión", definition: "Presión arterial elevada por encima de los valores normales." },
  { term: "Cardiopatía", definition: "Enfermedad del corazón." },
  { term: "Edema", definition: "Acumulación anormal de líquido en los tejidos." },
  { term: "Disnea", definition: "Dificultad para respirar o sensación de falta de aire." },
  { term: "Cianosis", definition: "Coloración azulada de la piel debido a falta de oxígeno." },
];

const getFileType = (url: string, title: string): string => {
  const extension = url.split('.').pop()?.toLowerCase() || '';
  const lowerTitle = title.toLowerCase();
  
  if (['pdf'].includes(extension) || lowerTitle.includes('pdf')) return 'pdf';
  if (['doc', 'docx'].includes(extension) || lowerTitle.includes('documento')) return 'doc';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension) || lowerTitle.includes('imagen')) return 'image';
  if (['mp3', 'wav', 'ogg'].includes(extension) || lowerTitle.includes('audio')) return 'audio';
  if (['ppt', 'pptx'].includes(extension) || lowerTitle.includes('presentación')) return 'presentation';
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

export const LessonSidePanel = ({
  materials,
  lessonId,
}: LessonSidePanelProps) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<string>("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem(`lesson-notes-${lessonId}`);
    if (storedNotes) {
      setSavedNotes(JSON.parse(storedNotes));
    } else {
      setSavedNotes([]);
    }
  }, [lessonId]);

  const saveNote = () => {
    if (!notes.trim()) return;
    
    const updatedNotes = [...savedNotes, notes.trim()];
    setSavedNotes(updatedNotes);
    localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(updatedNotes));
    setNotes("");
    setIsEditing(false);
    
    toast({
      title: "Nota guardada",
      description: "Tu nota se ha guardado correctamente.",
    });
  };

  const deleteNote = (index: number) => {
    const updatedNotes = savedNotes.filter((_, i) => i !== index);
    setSavedNotes(updatedNotes);
    localStorage.setItem(`lesson-notes-${lessonId}`, JSON.stringify(updatedNotes));
    
    toast({
      title: "Nota eliminada",
      description: "La nota se ha eliminado.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="resources" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-2 mr-4">
          <TabsTrigger value="resources" className="text-xs">
            Recursos
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">
            Notas
          </TabsTrigger>
          <TabsTrigger value="glossary" className="text-xs">
            Glosario
          </TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Materiales de la lección
              </h3>
              
              {materials.length === 0 ? (
                <Card className="p-6 text-center bg-muted/20">
                  <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay materiales disponibles para esta lección
                  </p>
                </Card>
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all group"
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

              {/* Quick Links Section */}
              <div className="pt-4 mt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Enlaces útiles
                </h3>
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Link2 className="h-4 w-4" />
                    <span>Referencias y bibliografía disponibles próximamente</span>
                  </div>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Mis notas
                </h3>
                {!isEditing && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Añadir
                  </Button>
                )}
              </div>

              {/* Note Editor */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Textarea
                    placeholder="Escribe tu nota aquí..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] bg-background/50"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNote} className="gap-1">
                      <Save className="h-3 w-3" />
                      Guardar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setNotes("");
                        setIsEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Saved Notes */}
              {savedNotes.length === 0 && !isEditing ? (
                <Card className="p-6 text-center bg-muted/20">
                  <Pencil className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No tienes notas para esta lección
                  </p>
                  <Button 
                    size="sm" 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsEditing(true)}
                  >
                    Crear una nota
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {savedNotes.map((note, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <Card className="p-3 bg-card/50 border-border/50">
                        <p className="text-sm pr-8 whitespace-pre-wrap">{note}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => deleteNote(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Términos médicos
              </h3>
              
              {glossaryTerms.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlossaryTooltip term={item.term} definition={item.definition}>
                    <Card className="p-3 bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-help">
                      <div className="flex items-start gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0">
                          {item.term}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.definition}
                      </p>
                    </Card>
                  </GlossaryTooltip>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
