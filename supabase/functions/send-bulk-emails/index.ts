import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  subject: string;
  message: string;
  connectionLink?: string;
  recipients: Array<{
    nombre: string;
    correo: string;
  }>;
  testMode?: boolean;
  testEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar que existe la API key
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("❌ RESEND_API_KEY no está configurada");
      throw new Error("RESEND_API_KEY no está configurada en los secrets");
    }
    
    console.log("✅ RESEND_API_KEY encontrada:", apiKey.substring(0, 10) + "...");

    const { subject, message, connectionLink, recipients, testMode, testEmail }: BulkEmailRequest =
      await req.json();

    console.log(`📨 Bulk email request - Recipients: ${recipients.length}, Test mode: ${testMode}`);

    // Si es modo prueba
    const emailsToSend = testMode && testEmail
      ? [{ nombre: "Test User", correo: testEmail }]
      : recipients;

    const results = [];
    const errors = [];

    for (const recipient of emailsToSend) {
      try {
        console.log(`📤 Intentando enviar a: ${recipient.correo}`);
        
        // HTML base del correo
        let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #213ECC;">Maestría Latinoamericana en Circulación Pulmonar</h2>
            <p>Hola ${recipient.nombre},</p>
            <div style="margin: 20px 0; line-height: 1.6;">
              ${message.replace(/\n/g, "<br>")}
            </div>
        `;

        if (connectionLink) {
          htmlContent += `
            <div style="margin: 30px 0; padding: 20px; background-color: #f4f4f4; border-radius: 5px;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Enlace de conexión:</p>
              <a href="${connectionLink}" style="color: #213ECC; word-break: break-all;">${connectionLink}</a>
            </div>
          `;
        }

        htmlContent += `
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Saludos cordiales,<br>
              <b>Equipo de la Maestría Latinoamericana en Circulación Pulmonar</b>
            </p>
          </div>
        `;

        // Enviar con Resend
        const emailResponse = await resend.emails.send({
          from: "Maestría Latinoamericana <no-reply@maestriacp.com>",
          reply_to: "Magisterenhipertensionpulmonar@gmail.com",
          to: [recipient.correo],
          subject,
          html: htmlContent,
        });

        console.log(`✅ Email sent to ${recipient.correo}:`, JSON.stringify(emailResponse));
        
        // Verificar si hay error en la respuesta
        if (emailResponse.error) {
          console.error(`❌ Error de Resend para ${recipient.correo}:`, emailResponse.error);
          errors.push({
            email: recipient.correo,
            error: emailResponse.error.message || "Error desconocido de Resend"
          });
          results.push({ 
            email: recipient.correo, 
            success: false, 
            error: emailResponse.error.message 
          });
        } else {
          results.push({ email: recipient.correo, success: true, id: emailResponse.data?.id });
        }
      } catch (error: any) {
        console.error(`❌ Error enviando a ${recipient.correo}:`, error);
        errors.push({
          email: recipient.correo,
          error: error.message || "Error desconocido"
        });
        results.push({ email: recipient.correo, success: false, error: error.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    // Si hay errores, incluirlos en la respuesta
    if (errors.length > 0) {
      console.error("⚠️ Errores encontrados:", JSON.stringify(errors));
      return new Response(
        JSON.stringify({
          success: failureCount < results.length, // Parcialmente exitoso si al menos uno pasó
          message: `${successCount} correos enviados, ${failureCount} fallaron`,
          results,
          errors,
        }),
        { 
          status: failureCount === results.length ? 400 : 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Correos enviados exitosamente: ${successCount}/${results.length}`,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: any) {
    console.error("🔥 Error en función de envío masivo:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: "Revisa los logs de la función para más información"
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
