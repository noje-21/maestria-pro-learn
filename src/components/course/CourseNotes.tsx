import { memo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Pencil, 
  Search, 
  Loader2, 
  Cloud, 
  Check,
  BookOpen,
  Trash2,
  FileText
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface LessonNote {
  id: string;
  lesson_id: string;
  content: string;
  updated_at: string;
  lesson_title?: string;
  module_title?: string;
}

interface CourseNotesProps {
  courseId: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  }>;
}

const NoteCard = memo(({ 
  note, 
  onClick,
  onDelete 
}: { 
  note: LessonNote; 
  onClick: () => void;
  onDelete: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.01 }}
    className="group"
  >
    <Card 
      className="p-4 cursor-pointer hover:border-primary/30 transition-all bg-card/50"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <h4 className="font-medium text-sm truncate">
              {note.lesson_title || 'Lección'}
            </h4>
          </div>
          {note.module_title && (
            <p className="text-xs text-muted-foreground truncate mb-2">
              {note.module_title}
            </p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {note.content}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Actualizada: {new Date(note.updated_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  </motion.div>
));

NoteCard.displayName = "NoteCard";

const CourseNotesComponent = ({ courseId, modules }: CourseNotesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create a map of lesson IDs to their titles and module titles
  const lessonMap = new Map<string, { lessonTitle: string; moduleTitle: string }>();
  modules.forEach(module => {
    module.lessons.forEach(lesson => {
      lessonMap.set(lesson.id, {
        lessonTitle: lesson.title,
        moduleTitle: module.title
      });
    });
  });

  // Get all lesson IDs for this course
  const lessonIds = modules.flatMap(m => m.lessons.map(l => l.id));

  const loadNotes = useCallback(async () => {
    if (!user || lessonIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const notesWithTitles = (data || []).map(note => ({
        ...note,
        lesson_title: lessonMap.get(note.lesson_id)?.lessonTitle,
        module_title: lessonMap.get(note.lesson_id)?.moduleTitle,
      }));

      setNotes(notesWithTitles);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, lessonIds.join(',')]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast({
        title: "Nota eliminada",
        description: "La nota se eliminó correctamente.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.lesson_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.module_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Mis Notas</h3>
          {notes.length > 0 && (
            <Badge variant="secondary">{notes.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Cloud className="h-3 w-3" />
          <span>Sincronizado</span>
        </div>
      </div>

      {/* Search */}
      {notes.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card className="p-8 text-center bg-card/50">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="font-medium mb-1">Sin notas aún</h4>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Cuando veas una lección, podrás escribir notas que se guardarán automáticamente
            y aparecerán aquí.
          </p>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card className="p-8 text-center bg-card/50">
          <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No se encontraron notas con "{searchQuery}"
          </p>
        </Card>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="grid gap-3 pr-3">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => window.location.href = `/lesson/${note.lesson_id}`}
                onDelete={() => handleDelete(note.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export const CourseNotes = memo(CourseNotesComponent);
