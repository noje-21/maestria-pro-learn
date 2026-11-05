import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const correo = String(body.correo ?? body.email ?? "").trim();
    const nombre = escapeHtml(body.nombre);
    const modalidad = escapeHtml(body.modalidad);
    const pais = escapeHtml(body.pais);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo.length > 255) {
      return new Response(JSON.stringify({ success: false, error: "Correo inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailResponse = await resend.emails.send({
      from: "Maestría Latinoamericana <no-reply@maestriacp.com>",
      to: [correo],
      subject: "Confirmación de registro - 5to Simposio Latinoamericano en Hipertensión Pulmonar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #213ECC;">¡Registro confirmado!</h2>
          <p>Hola ${nombre},</p>
          <p>Tu registro al <strong>5to Simposio Latinoamericano en Hipertensión Pulmonar</strong> ha sido confirmado.</p>
          <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #213ECC;">Detalles del evento</h3>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> 12 de noviembre de 2026</p>
            <p style="margin: 5px 0;"><strong>Lugar:</strong> Teatro Castelao, Centro Gallego – Moreno 2179, Buenos Aires, Argentina</p>
            ${modalidad ? `<p style="margin: 5px 0;"><strong>Modalidad:</strong> ${modalidad}</p>` : ""}
            ${pais ? `<p style="margin: 5px 0;"><strong>País:</strong> ${pais}</p>` : ""}
          </div>
          <p>Pronto recibirás más información sobre el evento.</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Saludos cordiales,<br>
            Equipo Organizador del Simposio
          </p>
        </div>
      `,
    });

    if ((emailResponse as any)?.error) {
      throw new Error((emailResponse as any).error.message ?? "Error enviando correo");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
