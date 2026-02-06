import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EnrollmentEmailRequest {
  leadId: string;
  fullName: string;
  email: string;
  country: string;
  specialty: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { leadId, fullName, email, country, specialty, phone }: EnrollmentEmailRequest = await req.json();

    console.log(`[SEND-ENROLLMENT-EMAILS] Processing for: ${email}`);

    // 1. Email to academic team
    const teamEmail = await resend.emails.send({
      from: "Maestría MLCP <no-reply@maestriacp.com>",
      to: ["Magisterenhipertensionpulmonar@gmail.com"],
      replyTo: email,
      subject: `Nueva preinscripción: ${fullName}`,
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a77 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Preinscripción</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a365d; margin-top: 0;">Datos del interesado:</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Nombre:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 500;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">País:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${country}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Especialidad:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${specialty}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Teléfono:</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${phone}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 12px; color: #64748b;">ID Lead:</td>
                <td style="padding: 12px; color: #94a3b8; font-size: 12px;">${leadId}</td>
              </tr>
            </table>
            
            <p style="color: #64748b; margin-top: 20px; font-size: 14px;">
              El usuario ha sido redirigido al proceso de pago. Recibirás otra notificación cuando se complete.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[SEND-ENROLLMENT-EMAILS] Team email sent:`, teamEmail);

    // 2. Confirmation email to user
    const userEmail = await resend.emails.send({
      from: "Maestría MLCP <no-reply@maestriacp.com>",
      to: [email],
      replyTo: "Magisterenhipertensionpulmonar@gmail.com",
      subject: "Tu inscripción está en proceso - Maestría en Circulación Pulmonar",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="text-align: center; padding: 30px 0;">
            <h1 style="color: #1a365d; margin: 0; font-size: 28px;">Maestría Latinoamericana</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">en Circulación Pulmonar</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 12px; margin: 20px 0;">
            <h2 style="color: #1a365d; margin: 0 0 15px 0;">¡Hola ${fullName.split(" ")[0]}!</h2>
            <p style="color: #475569; line-height: 1.6; margin: 0;">
              Hemos recibido tu solicitud de inscripción. Tu proceso está en marcha.
            </p>
          </div>
          
          <div style="padding: 20px 0;">
            <h3 style="color: #1a365d; margin: 0 0 15px 0;">Próximos pasos:</h3>
            <ol style="color: #475569; line-height: 1.8; padding-left: 20px;">
              <li>Completa el pago en la ventana de Stripe que se ha abierto</li>
              <li>Recibirás un email de confirmación con tus credenciales de acceso</li>
              <li>Ingresa al campus virtual y comienza tu formación</li>
            </ol>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #64748b; margin: 0; font-size: 14px;">
              <strong>¿Tienes dudas?</strong> Responde a este email y nuestro equipo te ayudará.
            </p>
          </div>
          
          <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e2e8f0; margin-top: 30px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Maestría Latinoamericana en Circulación Pulmonar<br>
              © 2025 Todos los derechos reservados
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[SEND-ENROLLMENT-EMAILS] User email sent:`, userEmail);

    return new Response(JSON.stringify({ success: true, teamEmail, userEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[SEND-ENROLLMENT-EMAILS] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
