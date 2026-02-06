import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  tempPassword?: string | null;
  isNewUser: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { email, fullName, tempPassword, isNewUser }: WelcomeEmailRequest = await req.json();

    console.log(`[SEND-WELCOME] Processing for: ${email}, isNewUser: ${isNewUser}`);

    const campusUrl = "https://id-preview--c00deda4-11f8-4517-b812-48646eaa5ea2.lovable.app/auth";

    const credentialsSection = isNewUser && tempPassword
      ? `
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 15px 0;">🔐 Tus credenciales de acceso:</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #78350f;">Contraseña temporal:</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 16px; background: #fff; padding: 8px 12px; border-radius: 4px; color: #1e293b; font-weight: 600;">${tempPassword}</td>
            </tr>
          </table>
          <p style="color: #92400e; margin: 15px 0 0 0; font-size: 13px;">
            ⚠️ Te recomendamos cambiar tu contraseña después del primer inicio de sesión.
          </p>
        </div>
      `
      : `
        <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #1e40af; margin: 0;">
            Ya tienes una cuenta en nuestra plataforma. Usa tus credenciales existentes para acceder.
          </p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Maestría MLCP <no-reply@maestriacp.com>",
      to: [email],
      replyTo: "Magisterenhipertensionpulmonar@gmail.com",
      subject: "🎉 ¡Bienvenido a la Maestría en Circulación Pulmonar!",
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2d4a77 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">¡Felicidades!</h1>
            <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 16px;">Tu inscripción ha sido confirmada</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a365d; margin: 0 0 20px 0;">Hola ${fullName.split(" ")[0]},</h2>
            
            <p style="color: #475569; line-height: 1.6;">
              Tu pago ha sido procesado exitosamente. Ya tienes acceso completo a la 
              <strong>Maestría Latinoamericana en Circulación Pulmonar</strong>.
            </p>
            
            ${credentialsSection}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${campusUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #1a365d 0%, #2d4a77 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Ingresar al Campus Virtual
              </a>
            </div>
            
            <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin: 0 0 15px 0;">Lo que encontrarás:</h3>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>Módulos especializados con expertos internacionales</li>
                <li>Material académico descargable</li>
                <li>Videos de alta calidad</li>
                <li>Evaluaciones y certificación</li>
                <li>Asistente IA para resolver tus dudas</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              ¿Tienes preguntas? Responde a este correo y nuestro equipo te ayudará.
            </p>
          </div>
          
          <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e2e8f0; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Maestría Latinoamericana en Circulación Pulmonar<br>
              © 2025 Todos los derechos reservados
            </p>
          </div>
        </div>
      `,
    });

    console.log(`[SEND-WELCOME] Email sent:`, emailResponse);

    // Also notify the team
    await resend.emails.send({
      from: "Maestría MLCP <no-reply@maestriacp.com>",
      to: ["Magisterenhipertensionpulmonar@gmail.com"],
      subject: `✅ Pago confirmado: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #059669;">Pago Confirmado</h2>
          <p><strong>Alumno:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Usuario nuevo:</strong> ${isNewUser ? "Sí" : "No (ya tenía cuenta)"}</p>
          <p style="color: #059669;">El usuario ya tiene acceso al campus virtual.</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[SEND-WELCOME] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
