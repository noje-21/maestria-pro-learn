import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    console.log(`Password reset requested for: ${email}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found:", email);
      return new Response(
        JSON.stringify({ success: false, error: "Usuario no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", profile.id);

    // Save reset code in dedicated table
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        email: email,
        reset_code: resetCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error saving reset code:", insertError);
      throw insertError;
    }

    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "Maestría Latinoamericana <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperación de contraseña – Maestría Latinoamericana",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #213ECC;">Recuperación de contraseña</h2>
          <p>Hola ${profile.full_name || ""},</p>
          <p>Has solicitado recuperar tu contraseña.</p>
          <p>Tu código de verificación es:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p style="color: #666;">Este código expira en 15 minutos.</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Si no solicitaste este cambio, ignora este mensaje.
          </p>
        </div>
      `,
    });

    console.log(`Reset email sent successfully to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Código enviado al correo" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending reset email:", error);
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
