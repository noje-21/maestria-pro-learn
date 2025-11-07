import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Video {
  id: string;
  lesson_id: string;
  video_url: string;
  title: string | null;
  order_number: number;
}

interface Lesson {
  id: string;
  title: string;
}

export const LessonVideosManager = () => {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [newVideo, setNewVideo] = useState({ url: "", title: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLessons();
  }, []);

  useEffect(() => {
    if (selectedLessonId) {
      loadVideos(selectedLessonId);
    }
  }, [selectedLessonId]);

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title")
        .order("lesson_number");

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las lecciones",
        variant: "destructive",
      });
    }
  };

  const loadVideos = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from("lesson_videos")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_number");

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error loading videos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los videos",
        variant: "destructive",
      });
    }
  };

  const addVideo = async () => {
    if (!selectedLessonId || !newVideo.url.trim()) {
      toast({
        title: "Error",
        description: "Selecciona una lección e ingresa una URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const maxOrder = videos.length > 0 
        ? Math.max(...videos.map(v => v.order_number)) 
        : 0;

      const { error } = await supabase.from("lesson_videos").insert({
        lesson_id: selectedLessonId,
        video_url: newVideo.url,
        title: newVideo.title || null,
        order_number: maxOrder + 1,
      });

      if (error) throw error;

      toast({
        title: "Video agregado",
        description: "El video se ha agregado correctamente",
      });

      setNewVideo({ url: "", title: "" });
      loadVideos(selectedLessonId);
    } catch (error) {
      console.error("Error adding video:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("lesson_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      toast({
        title: "Video eliminado",
        description: "El video se ha eliminado correctamente",
      });

      loadVideos(selectedLessonId);
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Gestionar Videos de Lecciones</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Lección
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una lección" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLessonId && (
            <>
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold">Agregar Nuevo Video</h4>
                <Input
                  placeholder="URL del video (YouTube, Vimeo, etc.)"
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, url: e.target.value })
                  }
                />
                <Input
                  placeholder="Título del video (opcional)"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                />
                <Button
                  onClick={addVideo}
                  disabled={loading}
                  className="btn-gradient-primary gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Video
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">
                  Videos Actuales ({videos.length})
                </h4>
                <div className="space-y-2">
                  {videos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay videos para esta lección
                    </p>
                  ) : (
                    videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Video className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {video.title || `Video ${video.order_number}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {video.video_url}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteVideo(video.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
