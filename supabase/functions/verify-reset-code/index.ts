import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword }: VerifyResetRequest = await req.json();

    console.log(`Verifying reset code for email: ${email}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up token from dedicated table
    const { data: token, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, reset_code, expires_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError || !token) {
      console.log(`No reset token found for email: ${email}`);
      return new Response(
        JSON.stringify({ success: false, error: "No se encontró solicitud de recuperación" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code is valid
    if (token.reset_code !== code) {
      console.log(`Invalid reset code attempt for email: ${email}`);
      return new Response(
        JSON.stringify({ success: false, error: "Código de verificación inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if code has expired
    if (new Date(token.expires_at) < new Date()) {
      console.log(`Code expired for email: ${email}`);
      // Clean up expired token
      await supabase.from("password_reset_tokens").delete().eq("id", token.id);
      return new Response(
        JSON.stringify({ success: false, error: "El código de verificación ha expirado" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      token.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      throw updateError;
    }

    // Delete all tokens for this user
    await supabase
      .from("password_reset_tokens")
      .delete()
      .eq("user_id", token.user_id);

    console.log(`Password reset successful for user ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Contraseña actualizada correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error verifying reset code:", error);
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
