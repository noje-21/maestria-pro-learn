import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_ID = "price_1Sxx6rCf1a6gJUEtzCYfBml9";

interface CheckoutRequest {
  leadId: string;
  email: string;
  fullName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, fullName }: CheckoutRequest = await req.json();

    if (!leadId || !email) {
      throw new Error("leadId y email son requeridos");
    }

    console.log(`[CREATE-CHECKOUT] Starting for lead: ${leadId}, email: ${email}`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[CREATE-CHECKOUT] Found existing customer: ${customerId}`);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: fullName,
        metadata: {
          lead_id: leadId,
        },
      });
      customerId = customer.id;
      console.log(`[CREATE-CHECKOUT] Created new customer: ${customerId}`);
    }

    // Update lead with stripe customer id
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("enrollment_leads")
      .update({ stripe_customer_id: customerId })
      .eq("id", leadId);

    // Create checkout session
    const origin = req.headers.get("origin") || "https://id-preview--c00deda4-11f8-4517-b812-48646eaa5ea2.lovable.app";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/enrollment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?enrollment=cancelled`,
      metadata: {
        lead_id: leadId,
      },
      payment_intent_data: {
        metadata: {
          lead_id: leadId,
        },
      },
    });

    console.log(`[CREATE-CHECKOUT] Session created: ${session.id}`);

    // Update lead with session id
    await supabaseAdmin
      .from("enrollment_leads")
      .update({ stripe_session_id: session.id })
      .eq("id", leadId);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[CREATE-CHECKOUT] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
