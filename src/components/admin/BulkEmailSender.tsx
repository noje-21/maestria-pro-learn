import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, TestTube, Eye, Save, Smile, Upload } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

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
  const [manualRecipients, setManualRecipients] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();

  // Validar correos manuales
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const parseManualRecipients = useCallback(() => {
    if (!manualRecipients.trim()) return [];
    
    const emails = manualRecipients
      .split(/[,;\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    const validEmails: Array<{ nombre: string; correo: string }> = [];
    const invalidEmails: string[] = [];
    
    emails.forEach(email => {
      if (validateEmail(email)) {
        validEmails.push({ nombre: email.split('@')[0], correo: email });
      } else {
        invalidEmails.push(email);
      }
    });
    
    if (invalidEmails.length > 0) {
      toast({
        title: "Correos inválidos detectados",
        description: `Los siguientes correos no son válidos: ${invalidEmails.join(', ')}`,
        variant: "destructive",
      });
      return null;
    }
    
    return validEmails;
  }, [manualRecipients, toast]);

  // Contador total de destinatarios
  const totalRecipients = useMemo(() => {
    const dbRecipients = selectedRecipients.size;
    const manualEmails = manualRecipients.split(/[,;\s]+/).filter(e => e.trim().length > 0).length;
    return dbRecipients + manualEmails;
  }, [selectedRecipients, manualRecipients]);

  // Manejador de subida de imágenes
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/gif,image/webp');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Imagen demasiado grande",
          description: "El tamaño máximo es 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploadingImage(true);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
          .from('email-assets')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('email-assets')
          .getPublicUrl(data.path);

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', urlData.publicUrl);
          quill.setSelection(range.index + 1, 0);
        }

        toast({
          title: "Imagen subida",
          description: "La imagen se agregó al correo correctamente",
        });
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error al subir imagen",
          description: error.message || "No se pudo subir la imagen",
          variant: "destructive",
        });
      } finally {
        setUploadingImage(false);
      }
    };
  }, [toast]);

  // Manejador de emojis
  const handleEmojiSelect = useCallback((emoji: any) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, emoji.native);
      quill.setSelection(range.index + emoji.native.length, 0);
    }
    setEmojiPickerOpen(false);
  }, []);

  // Configuración del editor Quill mejorada (estilo Gmail)
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image',
    'blockquote', 'code-block'
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

  // Guardar borrador (funcionalidad futura - requiere regeneración de tipos)
  const handleSaveDraft = async () => {
    toast({
      title: "Función próximamente",
      description: "La funcionalidad de guardar borradores estará disponible pronto",
    });
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

    // Parsear destinatarios manuales
    const manualEmailsList = parseManualRecipients();
    if (manualEmailsList === null) return; // Error en validación

    // Combinar destinatarios de BD con manuales
    const dbRecipients = registros.filter((r) => selectedRecipients.has(r.id));
    const allRecipients = [...dbRecipients, ...manualEmailsList];

    if (!isTest && allRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un destinatario o agregar correos manualmente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const recipients = isTest
        ? [{ nombre: "Administrador", correo: "noje665@gmail.com" }]
        : allRecipients;

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
        setSubject("");
        setMessage("");
        setConnectionLink("");
        setManualRecipients("");
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
          Redacta y envía correos personalizados con formato enriquecido
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Asunto */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-base font-semibold">Asunto del correo *</Label>
          <Input
            id="subject"
            placeholder="Ej: Información importante sobre el Simposio"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border-2 focus:border-primary transition-colors"
          />
        </div>

        {/* Editor de mensaje con barra personalizada */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Mensaje *</Label>
            <div className="flex gap-2">
              <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                  >
                    <Smile className="h-4 w-4" />
                    Emojis
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Picker
                    data={data}
                    onEmojiSelect={handleEmojiSelect}
                    theme="light"
                    locale="es"
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className="h-8 gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploadingImage ? "Subiendo..." : "Imagen"}
              </Button>
            </div>
          </div>
          <div className="border-2 border-border rounded-lg overflow-hidden bg-background shadow-sm hover:border-primary/50 transition-colors">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={message}
              onChange={setMessage}
              modules={modules}
              formats={formats}
              placeholder="Escribe tu mensaje aquí... Usa la barra de herramientas para dar formato"
              className="min-h-[300px] gmail-editor"
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            💡 Editor completo: formato enriquecido, imágenes, enlaces, listas y emojis
          </p>
        </div>

        {/* Enlace de conexión */}
        <div className="space-y-2">
          <Label htmlFor="link" className="text-base font-semibold">Enlace de conexión (opcional)</Label>
          <Input
            id="link"
            type="url"
            placeholder="https://zoom.us/j/123456789 o https://meet.google.com/abc-defg-hij"
            value={connectionLink}
            onChange={(e) => setConnectionLink(e.target.value)}
            className="border-2 focus:border-primary transition-colors"
          />
        </div>

        {/* Destinatarios manuales */}
        <div className="space-y-2">
          <Label htmlFor="manual" className="text-base font-semibold">Destinatarios adicionales (opcional)</Label>
          <Input
            id="manual"
            type="text"
            placeholder="correo1@ejemplo.com, correo2@ejemplo.com"
            value={manualRecipients}
            onChange={(e) => setManualRecipients(e.target.value)}
            className="border-2 focus:border-primary transition-colors"
          />
          <p className="text-xs text-muted-foreground">
            Separa múltiples correos con comas, espacios o punto y coma
          </p>
        </div>

        {/* Destinatarios de la base de datos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Destinatarios registrados</Label>
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

          <ScrollArea className="h-[280px] rounded-xl border-2 border-border/50 p-4 bg-muted/10">
            <div className="space-y-2">
              {registros.map((registro) => (
                <div
                  key={registro.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20"
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
                    <div className="font-medium text-foreground">{registro.nombre}</div>
                    <div className="text-sm text-muted-foreground">
                      {registro.correo} • {registro.modalidad}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Contador total */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-sm font-medium">
              <span className="text-2xl font-bold text-primary">{totalRecipients}</span> destinatario(s) en total
            </p>
            <div className="flex gap-2">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!message.trim()}>
                    <Eye className="h-4 w-4 mr-2" />
                    Vista previa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Vista previa del correo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-b pb-4 bg-muted/30 p-4 rounded-t-lg">
                      <p className="text-xs text-muted-foreground mb-1">De:</p>
                      <p className="font-medium text-sm">Maestría Latinoamericana en Circulación Pulmonar</p>
                      <p className="text-xs text-muted-foreground mt-3 mb-1">Para:</p>
                      <p className="text-sm text-muted-foreground">{totalRecipients} destinatario(s)</p>
                      <p className="text-xs text-muted-foreground mt-3 mb-1">Asunto:</p>
                      <p className="font-semibold text-lg text-foreground">{subject || "(Sin asunto)"}</p>
                    </div>
                    <div className="border rounded-lg p-8 bg-white dark:bg-gray-900">
                      <div className="max-w-2xl mx-auto">
                        <div 
                          className="prose prose-sm max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ __html: message }}
                        />
                        {connectionLink && (
                          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="font-semibold mb-2 text-sm text-blue-900 dark:text-blue-100">📎 Enlace de conexión:</p>
                            <a 
                              href={connectionLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 underline break-all hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                            >
                              {connectionLink}
                            </a>
                          </div>
                        )}
                        <div className="mt-8 pt-6 border-t text-sm text-gray-600 dark:text-gray-400">
                          <p>Saludos cordiales,</p>
                          <p className="font-semibold mt-1">Equipo de la Maestría Latinoamericana en Circulación Pulmonar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleSaveDraft}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar borrador
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => handleSendEmails(true)}
            variant="outline"
            disabled={loading || !subject.trim() || !message.trim()}
            className="flex-1 border-2 hover:border-primary/50"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Enviar prueba
          </Button>
          <Button
            onClick={() => handleSendEmails(false)}
            disabled={loading || totalRecipients === 0 || !subject.trim() || !message.trim()}
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Enviando..." : `Enviar a ${totalRecipients} destinatario(s)`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkEmailSender;
