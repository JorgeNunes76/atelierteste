import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createInvalidOriginResponse,
  getCorsHeaders,
  isAllowedOrigin,
} from "../_shared/site-config.ts";
import {
  consumeRateLimit,
  getClientIp,
  normalizeEmail,
} from "../_shared/public-form-guards.ts";

interface NewsletterBody {
  email: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseNewsletterBody(payload: unknown): NewsletterBody {
  if (!isPlainObject(payload)) throw new Error("Payload inv\u00e1lido.");

  const keys = Object.keys(payload);
  if (keys.length !== 1 || !("email" in payload)) {
    throw new Error("Payload inv\u00e1lido.");
  }

  if (typeof payload.email !== "string" || !payload.email.includes("@")) {
    throw new Error("Email inv\u00e1lido.");
  }

  return { email: normalizeEmail(payload.email) };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const requestOrigin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin)) {
      return createInvalidOriginResponse(req);
    }
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!isAllowedOrigin(requestOrigin)) {
      return createInvalidOriginResponse(req);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Configura\u00e7\u00e3o do servidor incompleta." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const rawBody: unknown = await req.json();
    let body: NewsletterBody;

    try {
      body = parseNewsletterBody(rawBody);
    } catch (validationErr) {
      console.warn("[subscribe-newsletter] validation:", (validationErr as Error).message, rawBody);
      return new Response(
        JSON.stringify({ error: (validationErr as Error).message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ip = getClientIp(req);
    const rateLimit = await consumeRateLimit(supabase, {
      formKey: "newsletter",
      fingerprint: `${ip}:${body.email}`,
      windowSeconds: 60,
      maxAttempts: 3,
    });

    if (!rateLimit.allowed) {
      console.warn("[subscribe-newsletter] rate limited:", { email: body.email, ip });
      return new Response(
        JSON.stringify({ error: "Demasiadas tentativas. Aguarda um minuto e tenta novamente." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("newsletter")
      .select("id, ativo")
      .eq("email", body.email)
      .maybeSingle();

    if (existingError) {
      console.error("[subscribe-newsletter] lookup:", existingError.message);
      throw existingError;
    }

    if (existing) {
      if (!existing.ativo) {
        const { error: updateError } = await supabase
          .from("newsletter")
          .update({ ativo: true })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[subscribe-newsletter] reactivate:", updateError.message);
          throw updateError;
        }
      }

      return new Response(
        JSON.stringify({ ok: true, status: existing.ativo ? "already_subscribed" : "ok" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: insertError } = await supabase
      .from("newsletter")
      .insert({ email: body.email });

    if (insertError) {
      console.error("[subscribe-newsletter] insert:", insertError.message);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ ok: true, status: "ok" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[subscribe-newsletter] unexpected:", err);
    return new Response(
      JSON.stringify({ error: "Erro ao subscrever. Tenta novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
