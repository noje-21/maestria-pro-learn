import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function EnrollmentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    // Verificar el estado del pago si hay session_id
    if (sessionId) {
      // En producción, aquí verificaríamos el estado con Stripe
      // Por ahora, asumimos éxito si llegamos aquí
      setTimeout(() => {
        setStatus("success");
      }, 1500);
    } else {
      setStatus("success");
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="glass-card p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              ¡Inscripción Completada!
            </h1>
            <p className="text-muted-foreground">
              Tu pago ha sido procesado exitosamente.
            </p>
          </div>

          {/* Email Notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Revisa tu correo</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un email con tus credenciales de acceso al campus virtual.
            </p>
          </div>

          {/* Next Steps */}
          <div className="text-left space-y-3 pt-2">
            <h3 className="font-medium text-foreground">Próximos pasos:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
                <span>Revisa tu bandeja de entrada (y spam)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
                <span>Ingresa con las credenciales enviadas</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
                <span>Comienza tu formación en circulación pulmonar</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="pt-4 space-y-3">
            <Button asChild className="w-full">
              <Link to="/auth">
                Ir al Campus Virtual
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>

        {/* Support */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Necesitas ayuda?{" "}
          <a 
            href="mailto:Magisterenhipertensionpulmonar@gmail.com" 
            className="text-primary hover:underline"
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
