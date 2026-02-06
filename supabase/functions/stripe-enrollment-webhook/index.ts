import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Helper to generate secure password
function generateSecurePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  for (let i = 0; i < 12; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`[WEBHOOK] Signature verification failed: ${err.message}`);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
    } else {
      // For testing without signature verification
      event = JSON.parse(body);
      console.log("[WEBHOOK] Running without signature verification (dev mode)");
    }

    console.log(`[WEBHOOK] Event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const leadId = session.metadata?.lead_id;

      if (!leadId) {
        console.error("[WEBHOOK] No lead_id in session metadata");
        return new Response(JSON.stringify({ error: "No lead_id found" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      console.log(`[WEBHOOK] Processing payment for lead: ${leadId}`);

      // Get lead data
      const { data: lead, error: leadError } = await supabaseAdmin
        .from("enrollment_leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (leadError || !lead) {
        console.error("[WEBHOOK] Lead not found:", leadError);
        throw new Error("Lead not found");
      }

      // Check if user already exists
      const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingAuthUsers?.users?.find(u => u.email === lead.email);

      let userId: string;
      let tempPassword: string | null = null;

      if (existingUser) {
        // User already exists, just update lead
        userId = existingUser.id;
        console.log(`[WEBHOOK] User already exists: ${userId}`);
      } else {
        // Create new user with generated password
        tempPassword = generateSecurePassword();

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: lead.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: lead.full_name,
            country: lead.country,
            specialty: lead.specialty,
          },
        });

        if (authError) {
          console.error("[WEBHOOK] Error creating user:", authError);
          throw authError;
        }

        userId = authData.user.id;
        console.log(`[WEBHOOK] Created new user: ${userId}`);

        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update profile to approved
        await supabaseAdmin
          .from("profiles")
          .update({ 
            status: "approved",
            country: lead.country,
          })
          .eq("id", userId);
      }

      // Get first active course to enroll user
      const { data: courses } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("status", "active")
        .eq("is_active", true)
        .limit(1);

      if (courses && courses.length > 0) {
        // Enroll user in course
        await supabaseAdmin
          .from("user_courses")
          .upsert({
            user_id: userId,
            course_id: lead.course_id || courses[0].id,
            status: "enrolled",
            enrolled_at: new Date().toISOString(),
          }, {
            onConflict: "user_id,course_id",
          });

        console.log(`[WEBHOOK] User enrolled in course`);
      }

      // Update lead status
      await supabaseAdmin
        .from("enrollment_leads")
        .update({
          status: "enrolled",
          user_id: userId,
          payment_completed_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      // Send welcome email with credentials
      const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "");
      
      await supabaseAdmin.functions.invoke("send-welcome-credentials", {
        body: {
          email: lead.email,
          fullName: lead.full_name,
          tempPassword: tempPassword,
          isNewUser: !existingUser,
        },
      });

      console.log(`[WEBHOOK] Payment processed successfully for lead: ${leadId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[WEBHOOK] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
