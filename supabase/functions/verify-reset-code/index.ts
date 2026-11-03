import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const MAX_ATTEMPTS = 5;
// After the code is verified, the user gets this long to type the new password.
const CHANGE_WINDOW_MS = 10 * 60 * 1000;

const BodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("verify"),
    email: z.string().trim().toLowerCase().email().max(255),
    code: z.string().trim().regex(/^\d{6}$/),
  }),
  z.object({
    action: z.literal("reset"),
    email: z.string().trim().toLowerCase().email().max(255),
    changeToken: z.string().min(32).max(128),
    newPassword: z.string().min(8).max(100),
  }),
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ success: false, error: "Datos inválidos" }, 400);
    const body = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: token } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, reset_code, expires_at, attempts, change_token_hash, change_expires_at")
      .eq("email", body.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!token) {
      return json({ success: false, error: "Solicita un código nuevo" }, 404);
    }

    if (body.action === "verify") {
      if (new Date(token.expires_at).getTime() < Date.now()) {
        await supabase.from("password_reset_tokens").delete().eq("id", token.id);
        return json({ success: false, error: "El código venció. Pide uno nuevo.", expired: true }, 400);
      }
      if (token.attempts >= MAX_ATTEMPTS) {
        await supabase.from("password_reset_tokens").delete().eq("id", token.id);
        return json({ success: false, error: "Demasiados intentos. Pide un código nuevo.", expired: true }, 429);
      }
      if ((await sha256(body.code)) !== token.reset_code) {
        await supabase
          .from("password_reset_tokens")
          .update({ attempts: token.attempts + 1 })
          .eq("id", token.id);
        const left = MAX_ATTEMPTS - token.attempts - 1;
        return json({ success: false, error: `Código incorrecto. Te quedan ${left} intentos.` }, 400);
      }

      const changeToken = randomToken();
      await supabase
        .from("password_reset_tokens")
        .update({
          change_token_hash: await sha256(changeToken),
          change_expires_at: new Date(Date.now() + CHANGE_WINDOW_MS).toISOString(),
          // Code can't be reused once verified.
          reset_code: "used",
          expires_at: new Date().toISOString(),
        })
        .eq("id", token.id);

      return json({ success: true, changeToken });
    }

    // action === "reset"
    if (
      !token.change_token_hash ||
      !token.change_expires_at ||
      new Date(token.change_expires_at).getTime() < Date.now() ||
      (await sha256(body.changeToken)) !== token.change_token_hash
    ) {
      return json({ success: false, error: "La verificación venció. Pide un código nuevo.", expired: true }, 400);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(token.user_id, {
      password: body.newPassword,
    });
    if (updateError) {
      console.error("Error updating password:", updateError);
      return json({ success: false, error: updateError.message }, 400);
    }

    await supabase.from("password_reset_tokens").delete().eq("user_id", token.user_id);
    return json({ success: true });
  } catch (error) {
    console.error("verify-reset-code error:", error);
    return json({ success: false, error: "Error inesperado" }, 500);
  }
});
