import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { z } from "zod";
import simposioImage from "@/assets/simposio-2025.jpg";

const simposioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200, "El nombre es muy largo"),
  correo: z.string().email("Correo electrónico inválido").max(255, "Correo muy largo"),
  pais: z.string().min(2, "Por favor selecciona un país").max(100, "País inválido"),
  documento: z.string()
    .min(1, "El documento es obligatorio")
    .max(15, "El documento no puede tener más de 15 caracteres")
    .regex(/^[0-9]+$/, "El documento debe contener solo números"),
  telefono: z.string().max(50, "Teléfono muy largo").optional().or(z.literal("")),
  modalidad: z.string().min(1, "Selecciona una modalidad"),
});

const Simposio = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    pais: "",
    documento: "",
    telefono: "",
    modalidad: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate data
      const validatedData = simposioSchema.parse(formData);

      setLoading(true);

      // Save to database
      const { error } = await supabase.from("simposio_registros").insert([validatedData]);

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-simposio-confirmation", {
          body: {
            email: validatedData.correo,
            nombre: validatedData.nombre,
          },
        });
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the registration if email fails
      }

      // Show success message
      setShowSuccess(true);

      // Reset form
      setFormData({
        nombre: "",
        correo: "",
        pais: "",
        documento: "",
        telefono: "",
        modalidad: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: error.issues[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo completar el registro. Intenta nuevamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate("/")} className="mb-6 border-primary/50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Simposio Image */}
          <img
            src={simposioImage}
            alt="4to Simposio Latinoamericano de Hipertensión Pulmonar"
            className="w-full rounded-2xl shadow-lg"
          />

          {/* Event Info */}
          <div className="glass-card p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
              4to Simposio Latinoamericano de Hipertensión Pulmonar
            </h1>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>14 de Noviembre 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Formulario de Registro</CardTitle>
              <CardDescription>Completa tus datos para registrarte al evento gratuito</CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="text-5xl">✅</div>
                  <h3 className="text-2xl font-bold text-primary">Gracias por su participación</h3>
                  <p className="text-muted-foreground">
                    Pronto le enviaremos el link de conexión a su correo electrónico.
                  </p>
                  <Button onClick={() => setShowSuccess(false)} className="mt-4">
                    Registrar otra persona
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo">Correo electrónico *</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    placeholder="juan@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Input
                    id="pais"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    placeholder="Argentina"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">Documento / DNI *</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      if (value.length <= 15) {
                        setFormData({ ...formData, documento: value });
                      }
                    }}
                    placeholder="12345678"
                    required
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+54 11 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalidad">Modalidad *</Label>
                  <Select value={formData.modalidad} onValueChange={(value) => setFormData({ ...formData, modalidad: value })}>
                    <SelectTrigger id="modalidad">
                      <SelectValue placeholder="Selecciona modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full btn-gradient-primary" disabled={loading}>
                  {loading ? "Registrando..." : "Registrarme al Simposio"}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Simposio;
