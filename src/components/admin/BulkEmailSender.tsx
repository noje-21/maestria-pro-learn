import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, TestTube, Eye, Save } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type Recipient = {
  id: string;
  nombre: string;
  correo: string;
  modalidad: string;
};

type BulkEmailSenderProps = {
  registros: Recipient[];
};

const BulkEmailSender = ({ registros }: BulkEmailSenderProps) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [connectionLink, setConnectionLink] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();

  // Configuración del editor Quill
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecipients(new Set(registros.map((r) => r.id)));
    } else {
      setSelectedRecipients(new Set());
    }
  };

  const handleSelectRecipient = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRecipients);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRecipients(newSelected);
  };

  const handleSendEmails = async (isTest: boolean = false) => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "El asunto y el mensaje son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!isTest && selectedRecipients.size === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un destinatario",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const recipients = isTest
        ? [{ nombre: "Administrador", correo: "admin@test.com" }] // Replace with actual admin email
        : registros.filter((r) => selectedRecipients.has(r.id));

      const { data, error } = await supabase.functions.invoke("send-bulk-emails", {
        body: {
          recipients,
          subject,
          message,
          connectionLink: connectionLink || undefined,
        },
      });

      if (error) {
        console.error("Error al invocar función:", error);
        throw error;
      }

      // Revisar si hubo errores de Resend en la respuesta
      if (data?.errors && data.errors.length > 0) {
        const errorMessages = data.errors.map((e: any) => `${e.email}: ${e.error}`).join("\n");
        toast({
          title: "Algunos correos fallaron",
          description: data.message + "\n\nDetalles:\n" + errorMessages,
          variant: "destructive",
        });
        return;
      }

      if (!data?.success) {
        toast({
          title: "Error al enviar correos",
          description: data?.error || data?.message || "Ocurrió un error desconocido",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isTest ? "Correo de prueba enviado" : "Correos enviados",
        description: data?.message || "Los correos fueron enviados correctamente",
      });

      if (!isTest) {
        // Reset form after successful send
        setSubject("");
        setMessage("");
        setConnectionLink("");
        setSelectedRecipients(new Set());
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron enviar los correos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-2xl text-primary flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Enviar correos a participantes
        </CardTitle>
        <CardDescription>
          Envía correos personalizados a los participantes registrados en el simposio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Asunto del correo *</Label>
            <Input
              id="subject"
              placeholder="Ej: Información importante sobre el Simposio"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <div className="border border-border rounded-lg overflow-hidden bg-background shadow-sm">
              <ReactQuill
                theme="snow"
                value={message}
                onChange={setMessage}
                modules={modules}
                formats={formats}
                placeholder="Escribe tu mensaje aquí... Usa la barra de herramientas para dar formato"
                className="min-h-[250px]"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>💡 Usa la barra de herramientas para formato enriquecido: negritas, colores, listas, enlaces e imágenes</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Enlace de conexión (opcional)</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://zoom.us/j/123456789 o https://meet.google.com/abc-defg-hij"
              value={connectionLink}
              onChange={(e) => setConnectionLink(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Destinatarios</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="selectAll"
                checked={selectedRecipients.size === registros.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="selectAll" className="font-normal cursor-pointer">
                Seleccionar todos ({registros.length})
              </Label>
            </div>
          </div>

          <ScrollArea className="h-[300px] rounded-xl border border-border/50 p-4">
            <div className="space-y-2">
              {registros.map((registro) => (
                <div
                  key={registro.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    id={registro.id}
                    checked={selectedRecipients.has(registro.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRecipient(registro.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={registro.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    <div className="font-medium">{registro.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {registro.correo} • {registro.modalidad}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm font-medium">
              <span className="text-xl font-bold text-primary">{selectedRecipients.size}</span> participante(s) seleccionado(s)
            </p>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={!message.trim()}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista previa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Vista previa del correo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <p className="text-sm text-muted-foreground">De:</p>
                    <p className="font-medium">Maestría Latinoamericana en Circulación Pulmonar</p>
                    <p className="text-sm text-muted-foreground mt-2">Asunto:</p>
                    <p className="font-semibold text-lg">{subject || "(Sin asunto)"}</p>
                  </div>
                  <div className="border rounded-lg p-6 bg-background">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: message }}
                    />
                    {connectionLink && (
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                        <p className="font-semibold mb-2">Enlace de conexión:</p>
                        <a 
                          href={connectionLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary underline break-all hover:text-primary/80"
                        >
                          {connectionLink}
                        </a>
                      </div>
                    )}
                    <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
                      <p>Saludos cordiales,</p>
                      <p className="font-semibold">Equipo de la Maestría Latinoamericana en Circulación Pulmonar</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => handleSendEmails(true)}
            variant="outline"
            disabled={loading || !subject.trim() || !message.trim()}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Enviar prueba
          </Button>
          <Button
            onClick={() => handleSendEmails(false)}
            disabled={loading || selectedRecipients.size === 0 || !subject.trim() || !message.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Enviando..." : `Enviar a ${selectedRecipients.size} participante(s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkEmailSender;
