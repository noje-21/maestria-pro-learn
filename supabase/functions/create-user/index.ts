import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  country?: string;
  role?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, country, role }: CreateUserRequest = await req.json();

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, password y fullName son requeridos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Creating user: ${email}`);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify requester is admin (if auth header present)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (!authError && user) {
        // Check if requester is admin
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          return new Response(
            JSON.stringify({ success: false, error: "No tienes permisos de administrador" }),
            {
              status: 403,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
      }
    }

    // Check if user already exists in auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email);

    if (existingAuthUser) {
      // Check if user exists in profiles
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "El usuario ya existe en el sistema",
            userId: existingProfile.id
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // User exists in Auth but not in profiles (orphaned) - delete from Auth first
      console.log(`Cleaning orphaned auth user: ${email}`);
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
      
      if (deleteAuthError) {
        console.error("Error cleaning orphaned auth user:", deleteAuthError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "No se pudo limpiar el usuario existente en Auth. Intenta nuevamente."
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
      console.log(`Orphaned auth user cleaned successfully: ${email}`);
    }

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        country: country || "",
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("No se pudo crear el usuario");
    }

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile status to approved
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ status: "approved" })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Add role if specified and not student (student is default)
    if (role && role !== "student") {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({
          user_id: authData.user.id,
          role: role as any,
        });

      if (roleError) {
        console.error("Error adding role:", roleError);
      }
    }

    console.log(`User created successfully: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuario creado exitosamente",
        userId: authData.user.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error creating user:", error);
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
