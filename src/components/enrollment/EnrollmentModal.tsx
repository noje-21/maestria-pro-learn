import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, GraduationCap, CheckCircle } from "lucide-react";

const enrollmentSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre muy largo")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo letras y espacios"),
  email: z.string().email("Email inválido").max(255, "Email muy largo"),
  country: z.string().min(2, "Selecciona un país"),
  specialty: z.string().min(2, "Selecciona una especialidad"),
  phone: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
}

const countries = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "España", "Guatemala", "Honduras",
  "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico",
  "República Dominicana", "Uruguay", "Venezuela", "Otro"
];

const specialties = [
  "Cardiología", "Neumología", "Medicina Interna", "Medicina Intensiva",
  "Cirugía Cardiovascular", "Pediatría", "Anestesiología", 
  "Medicina Familiar", "Reumatología", "Otra especialidad"
];

export function EnrollmentModal({ open, onOpenChange, courseId }: EnrollmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onSubmit = async (data: EnrollmentFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Guardar lead en Supabase
      const { data: leadData, error: leadError } = await supabase
        .from("enrollment_leads")
        .insert({
          full_name: data.fullName,
          email: data.email,
          country: data.country,
          specialty: data.specialty,
          phone: data.phone || null,
          course_id: courseId || null,
          status: "pending",
        })
        .select()
        .single();

      if (leadError) {
        if (leadError.code === "23505") {
          toast({
            title: "Email ya registrado",
            description: "Este email ya tiene una preinscripción activa. Revisa tu correo o contacta al equipo.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        throw leadError;
      }

      // 2. Enviar emails (notificación al equipo y confirmación al usuario)
      const { error: emailError } = await supabase.functions.invoke("send-enrollment-emails", {
        body: {
          leadId: leadData.id,
          fullName: data.fullName,
          email: data.email,
          country: data.country,
          specialty: data.specialty,
          phone: data.phone,
        },
      });

      if (emailError) {
        console.error("Error sending emails:", emailError);
        // No bloqueamos el flujo si falla el email
      }

      // 3. Crear sesión de pago en Stripe
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-enrollment-checkout",
        {
          body: {
            leadId: leadData.id,
            email: data.email,
            fullName: data.fullName,
          },
        }
      );

      if (checkoutError || !checkoutData?.url) {
        throw new Error("Error al crear sesión de pago");
      }

      // 4. Mostrar éxito y redirigir a Stripe
      setStep('success');
      
      setTimeout(() => {
        window.open(checkoutData.url, "_blank");
      }, 2000);

    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error en la inscripción",
        description: error.message || "Ocurrió un error. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        {step === 'form' ? (
          <>
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  Inscripción a la Maestría
                </DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                Completa tus datos para iniciar el proceso de inscripción. Recibirás un email de confirmación.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Dr. Juan Pérez"
                  {...register("fullName")}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan.perez@hospital.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>País *</Label>
                  <Select onValueChange={(value) => setValue("country", value)}>
                    <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Especialidad *</Label>
                  <Select onValueChange={(value) => setValue("specialty", value)}>
                    <SelectTrigger className={errors.specialty ? "border-destructive" : ""}>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialty && (
                    <p className="text-sm text-destructive">{errors.specialty.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  {...register("phone")}
                />
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Continuar al pago"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Al continuar, aceptas nuestros términos y condiciones.
                  Serás redirigido a Stripe para completar el pago de forma segura.
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">¡Preinscripción registrada!</h3>
              <p className="text-muted-foreground">
                Se abrirá una nueva ventana para completar tu pago de forma segura con Stripe.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Revisa tu correo para más información.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
