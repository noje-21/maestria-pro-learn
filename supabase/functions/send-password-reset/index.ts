import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

// Reset codes are valid for exactly 60 seconds.
const CODE_TTL_MS = 60 * 1000;
const FROM = "Maestría Latinoamericana <no-reply@maestriacp.com>";

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateCode(): string {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return (100000 + (n[0] % 900000)).toString();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ success: false, error: "Correo electrónico inválido" }, 400);
    const { email } = parsed.data;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ success: false, error: "El envío de correos no está configurado" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .ilike("email", email)
      .maybeSingle();

    // Generic answer when the account doesn't exist (avoid revealing registered emails).
    if (!profile) {
      return json({ success: true, expiresInSeconds: CODE_TTL_MS / 1000 });
    }

    // Cooldown: one code per minute.
    const { data: existing } = await supabase
      .from("password_reset_tokens")
      .select("created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const elapsed = Date.now() - new Date(existing.created_at).getTime();
      if (elapsed < CODE_TTL_MS) {
        const wait = Math.ceil((CODE_TTL_MS - elapsed) / 1000);
        return json(
          { success: false, error: `Espera ${wait} segundos para pedir otro código`, retryAfterSeconds: wait },
          429,
        );
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    await supabase.from("password_reset_tokens").delete().eq("user_id", profile.id);

    const { error: insertError } = await supabase.from("password_reset_tokens").insert({
      user_id: profile.id,
      email,
      reset_code: await sha256(code),
      expires_at: expiresAt.toISOString(),
    });
    if (insertError) {
      console.error("Error saving reset code:", insertError);
      return json({ success: false, error: "No se pudo generar el código" }, 500);
    }

    const name = (profile.full_name || "").replace(/[<>&"]/g, "");
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background:#ffffff; color:#1f2937; padding: 32px;">
        <h2 style="color:#213ECC; margin:0 0 16px;">Código para cambiar tu contraseña</h2>
        <p>Hola${name ? ` ${name}` : ""},</p>
        <p>Usa este código para cambiar tu contraseña en Maestría Latinoamericana:</p>
        <div style="background:#f3f4f6; border-radius:8px; padding:20px; text-align:center; font-size:34px; font-weight:bold; letter-spacing:8px; margin:24px 0;">
          ${code}
        </div>
        <p style="color:#b91c1c; font-weight:bold;">Este código vence en 1 minuto.</p>
        <p style="color:#6b7280; font-size:13px; margin-top:28px;">
          Si no pediste este cambio, ignora este correo. Tu contraseña no cambiará.
        </p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [profile.email || email],
        subject: `Tu código: ${code} (vence en 1 minuto)`,
        html,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend failed [${res.status}]: ${details}`);
      await supabase.from("password_reset_tokens").delete().eq("user_id", profile.id);
      return json({ success: false, error: "No se pudo enviar el correo. Intenta de nuevo.", status: res.status }, 502);
    }

    return json({ success: true, expiresInSeconds: CODE_TTL_MS / 1000 });
  } catch (error) {
    console.error("send-password-reset error:", error);
    return json({ success: false, error: "Error inesperado" }, 500);
  }
});
