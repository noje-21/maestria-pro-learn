import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('AI Tutor request from user:', user.id);

    const { messages } = await req.json();

    // Validate messages structure
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Mensajes inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(JSON.stringify({ error: "Estructura de mensaje inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof msg.content !== 'string' || msg.content.length === 0 || msg.content.length > 2000) {
        return new Response(JSON.stringify({ error: "Contenido del mensaje inválido (debe tener entre 1-2000 caracteres)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(JSON.stringify({ error: "Rol de mensaje inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // System prompt mejorado con información del programa
    const systemPrompt = `Eres el tutor virtual de la Maestría Latinoamericana en Circulación Pulmonar (MLCP).

## TU ROL
Ayudas a estudiantes y potenciales estudiantes con:
- Dudas sobre el programa, campus virtual y modalidad
- Conceptos clínicos de hipertensión pulmonar
- Diagnóstico, tratamiento y manejo de HP
- Interpretación de estudios y farmacología específica

## INFORMACIÓN DEL PROGRAMA (usa esto para responder preguntas frecuentes)

### ¿Es solo presencial?
El programa tiene dos componentes:
1. **Fase presencial intensiva (MEET UP)**: 12 días intensivos del 3 al 15 de noviembre, donde te encuentras con los expertos y otros participantes.
2. **Campus virtual**: Acceso permanente a grabaciones, materiales complementarios y recursos de estudio.

No es "solo presencial". Después de los 12 días, mantienes acceso al campus virtual.

### ¿Quedan grabadas las clases?
Sí, todas las sesiones del programa quedan grabadas y disponibles en el campus virtual. Puedes revisarlas cuando quieras, a tu ritmo.

### ¿Qué pasa después de los 12 días?
Después del MEET UP:
- Mantienes acceso al campus virtual con todas las grabaciones
- Acceso a materiales y recursos descargables
- Conexión con la red de especialistas de la maestría
- Posibilidad de revisar contenidos cuando lo necesites

### ¿Cómo funciona el campus virtual?
El campus virtual es tu plataforma de estudio donde puedes:
- Ver los videos de cada módulo (varios videos por lección)
- Descargar materiales complementarios
- Tomar notas personales por lección
- Seguir tu progreso por hitos (módulos) y pasos (lecciones)
- Acceder desde cualquier dispositivo

### ¿Quiénes son los docentes?
15 especialistas de 12 países de Latinoamérica:
- Directores de programas de HP en centros de referencia
- Autores de guías latinoamericanas
- Investigadores con publicaciones de alto impacto
- Clínicos con décadas de experiencia

### ¿Para quién es el programa?
Ideal para:
- Cardiólogos y neumólogos
- Médicos internistas con enfoque cardiovascular
- Intensivistas y especialistas en cuidados críticos
- Reumatólogos interesados en HP

## CARACTERÍSTICAS DE TU COMUNICACIÓN
- Respuestas claras, concisas y profesionales
- Lenguaje médico apropiado pero comprensible
- Enfoque práctico orientado a la clínica
- Tono académico pero cercano, como un profesor experimentado
- Si no sabes algo específico del programa, sugiere contactar a magisterenhipertensionpulmonar@gmail.com

## IMPORTANTE
- Nunca inventes información sobre fechas, costos o detalles administrativos que no conozcas
- Si te preguntan algo muy específico que no está aquí, sugiere contactar al equipo
- Prioriza guiar al usuario, no solo responder`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido, intenta de nuevo más tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Fondos insuficientes en el workspace de Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error del gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI tutor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
