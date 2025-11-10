import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.log("User not found:", email);
      // Return success even if user not found (security best practice)
      return new Response(
        JSON.stringify({ success: true, message: "If the email exists, a reset code will be sent" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store code in database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        reset_code: resetCode,
        reset_code_expires_at: expiresAt,
      })
      .eq("id", profile.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`Sending password reset email to ${email} with code ${resetCode}`);

    // Send email with reset code
    const emailResponse = await resend.emails.send({
      from: "Maestría en Circulación Pulmonar <onboarding@resend.dev>",
      to: [email],
      subject: "Recuperación de contraseña – Maestría Latinoamericana",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #213ECC; border-bottom: 2px solid #213ECC; padding-bottom: 10px;">
            Recuperación de contraseña
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Hola${profile.full_name ? ` <strong>${profile.full_name}</strong>` : ''},
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Has solicitado recuperar tu contraseña.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #213ECC; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af;">
              Tu código de verificación es:
            </p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: #213ECC; letter-spacing: 4px;">
              ${resetCode}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              Este código expira en 15 minutos
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Si no solicitaste este cambio, ignora este mensaje.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Atentamente,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Equipo de la Maestría Latinoamericana en Circulación Pulmonar</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Maestría Latinoamericana en Circulación Pulmonar</p>
          </div>
        </div>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Reset code sent" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
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
