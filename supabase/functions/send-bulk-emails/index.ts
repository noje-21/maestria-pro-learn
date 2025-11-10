import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  recipients: Array<{ nombre: string; correo: string }>;
  subject: string;
  message: string;
  connectionLink?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, connectionLink }: BulkEmailRequest = await req.json();

    console.log(`Sending bulk emails to ${recipients.length} recipients`);

    // Send emails individually
    const emailPromises = recipients.map(async (recipient) => {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #213ECC; border-bottom: 2px solid #213ECC; padding-bottom: 10px;">
            ${subject}
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Estimado/a <strong>${recipient.nombre}</strong>,
          </p>
          
          <div style="font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
            ${message}
          </div>
          
          ${connectionLink ? `
          <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #213ECC;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; font-weight: bold;">
              Enlace de conexión:
            </p>
            <p style="margin: 0;">
              <a href="${connectionLink}" style="color: #213ECC; text-decoration: underline; word-break: break-all;">
                ${connectionLink}
              </a>
            </p>
          </div>
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Atentamente,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Equipo de la Maestría Latinoamericana en Circulación Pulmonar</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Maestría Latinoamericana en Circulación Pulmonar</p>
            <p>
              <a href="mailto:magisterenhipertensionpulmonar@gmail.com" style="color: #213ECC;">
                magisterenhipertensionpulmonar@gmail.com
              </a> | 
              <a href="https://www.maestriacp.com" style="color: #213ECC;">
                www.maestriacp.com
              </a>
            </p>
          </div>
        </div>
      `;

      return resend.emails.send({
        from: "Maestría en Circulación Pulmonar <onboarding@resend.dev>",
        to: [recipient.correo],
        subject: subject,
        html: htmlContent,
      });
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Bulk email results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful,
        failed: failed,
        message: `${successful} correo(s) enviado(s) exitosamente${failed > 0 ? `, ${failed} fallido(s)` : ''}` 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending bulk emails:", error);
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
