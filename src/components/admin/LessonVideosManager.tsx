import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Video, Edit, Eye, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

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
      setInitialLoading(true);
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
    } finally {
      setInitialLoading(false);
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

  const updateVideo = async () => {
    if (!editingVideo) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("lesson_videos")
        .update({
          video_url: editingVideo.video_url,
          title: editingVideo.title,
        })
        .eq("id", editingVideo.id);

      if (error) throw error;

      toast({
        title: "Video actualizado",
        description: "El video se ha actualizado correctamente",
      });

      setEditingVideo(null);
      loadVideos(selectedLessonId);
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el video",
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

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("/").pop()?.split("?")[0]
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center p-12 bg-background/50 rounded-lg border border-border">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground font-medium">Cargando lecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/20 shadow-lg">
        <div className="border-b border-border/50 pb-4 mb-6 bg-gradient-to-r from-primary/5 to-transparent -m-6 p-6 rounded-t-lg">
          <h3 className="text-2xl font-bold text-primary">Gestión de Videos</h3>
          <p className="text-sm text-muted-foreground mt-1">Administra los videos de cada lección</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Lección
            </label>
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger className="border-primary/20">
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
              <div className="border-t border-border/50 pt-6 space-y-3 bg-muted/10 p-4 rounded-xl">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Agregar Nuevo Video
                </h4>
                <Input
                  placeholder="URL del video (YouTube, Vimeo, etc.)"
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, url: e.target.value })
                  }
                  className="border-primary/20"
                />
                <Input
                  placeholder="Título del video (opcional)"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                  className="border-primary/20"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addVideo}
                    disabled={loading}
                    className="btn-gradient-primary gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Video
                  </Button>
                  {newVideo.url && (
                    <Button
                      onClick={() => {
                        setPreviewUrl(newVideo.url);
                        setShowPreview(true);
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Vista Previa
                    </Button>
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Videos Actuales ({videos.length})
                </h4>
                <div className="space-y-3">
                  {videos.length === 0 ? (
                    <div className="text-center py-8 bg-muted/10 rounded-xl border border-dashed border-border">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No hay videos para esta lección
                      </p>
                    </div>
                  ) : (
                    videos.map((video, index) => (
                      <div
                        key={video.id}
                        className={`flex items-center justify-between p-4 rounded-xl border shadow-sm transition-all ${
                          index % 2 === 0 ? "bg-background border-border/50" : "bg-muted/10 border-muted"
                        }`}
                      >
                        {editingVideo?.id === video.id ? (
                          <div className="flex-1 space-y-2">
                            <Input
                              value={editingVideo.video_url}
                              onChange={(e) =>
                                setEditingVideo({
                                  ...editingVideo,
                                  video_url: e.target.value,
                                })
                              }
                              placeholder="URL del video"
                              className="border-primary/20"
                            />
                            <Input
                              value={editingVideo.title || ""}
                              onChange={(e) =>
                                setEditingVideo({
                                  ...editingVideo,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Título del video"
                              className="border-primary/20"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={updateVideo}
                                disabled={loading}
                                className="bg-success hover:bg-success/90"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingVideo(null)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Video className="h-5 w-5 text-primary flex-shrink-0" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {video.title || `Video ${video.order_number}`}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {video.video_url}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPreviewUrl(video.video_url);
                                  setShowPreview(true);
                                }}
                                className="border-primary/20 hover:bg-primary/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingVideo(video)}
                                className="border-primary/20 hover:bg-primary/10"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteVideo(video.id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa del Video</DialogTitle>
            <DialogDescription>
              Previsualización del contenido del video
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              src={getEmbedUrl(previewUrl)}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};