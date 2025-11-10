import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  nombre: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nombre }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending confirmation email to ${email} for ${nombre}`);

    const emailResponse = await resend.emails.send({
      from: "Maestría en Circulación Pulmonar <onboarding@resend.dev>",
      to: [email],
      subject: "Confirmación de inscripción – Simposio Internacional",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Confirmación de inscripción
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>${nombre}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Gracias por registrarte en el <strong>4to Simposio Latinoamericano de Hipertensión Pulmonar</strong>.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Pronto te enviaremos el enlace de conexión y más detalles al correo proporcionado.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #2563eb;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Fecha:</strong> 14 de Noviembre 2025<br>
              <strong>Lugar:</strong> Buenos Aires, Argentina
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Atentamente,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            <strong>Equipo de la Maestría Latinoamericana en Circulación Pulmonar</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Maestría Latinoamericana en Circulación Pulmonar</p>
            <p>
              <a href="mailto:magisterenhipertensionpulmonar@gmail.com" style="color: #2563eb;">
                magisterenhipertensionpulmonar@gmail.com
              </a> | 
              <a href="https://www.maestriacp.com" style="color: #2563eb;">
                www.maestriacp.com
              </a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
