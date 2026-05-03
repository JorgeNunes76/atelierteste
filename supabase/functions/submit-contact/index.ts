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

interface ContactRequestBody {
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
  assunto?: string;
  website?: string;
  submitted_at?: number;
}

const ALLOWED_FIELDS = new Set([
  "nome",
  "email",
  "telefone",
  "mensagem",
  "assunto",
  "website",
  "submitted_at",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("Payload inv\u00e1lido.");
  return value.trim();
}

function parseContactPayload(payload: unknown): ContactRequestBody {
  if (!isPlainObject(payload)) throw new Error("Payload inv\u00e1lido.");

  const keys = Object.keys(payload);
  const unexpected = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unexpected.length > 0) {
    throw new Error(`Payload cont\u00e9m campos inesperados: ${unexpected.join(", ")}`);
  }

  const nome = optionalString(payload.nome);
  const email = optionalString(payload.email);
  const mensagem = optionalString(payload.mensagem);
  const assunto = optionalString(payload.assunto);
  const telefone = optionalString(payload.telefone);
  const website = optionalString(payload.website) ?? "";
  const submittedAt = payload.submitted_at;

  if (!nome || nome.length < 2 || nome.length > 120) {
    throw new Error("Nome inv\u00e1lido.");
  }

  if (!email || !email.includes("@") || email.length > 190) {
    throw new Error("Email inv\u00e1lido.");
  }

  if (!mensagem || mensagem.length < 10 || mensagem.length > 5000) {
    throw new Error("Mensagem inv\u00e1lida.");
  }

  if (assunto && assunto.length > 80) {
    throw new Error("Assunto inv\u00e1lido.");
  }

  if (telefone && telefone.length > 40) {
    throw new Error("Telefone inv\u00e1lido.");
  }

  if (submittedAt !== undefined && (!Number.isFinite(submittedAt) || submittedAt <= 0)) {
    throw new Error("submitted_at inv\u00e1lido.");
  }

  return {
    nome,
    email: normalizeEmail(email),
    telefone,
    mensagem,
    assunto,
    website,
    submitted_at: typeof submittedAt === "number" ? submittedAt : undefined,
  };
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
    let body: ContactRequestBody;

    try {
      body = parseContactPayload(rawBody);
    } catch (validationErr) {
      console.warn("[submit-contact] validation:", (validationErr as Error).message, rawBody);
      return new Response(
        JSON.stringify({ error: (validationErr as Error).message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.website) {
      console.warn("[submit-contact] honeypot triggered");
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.submitted_at && Date.now() - body.submitted_at < 1500) {
      console.warn("[submit-contact] suspicious fast submit:", { email: body.email });
      return new Response(
        JSON.stringify({ error: "Submiss\u00e3o inv\u00e1lida. Tenta novamente." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ip = getClientIp(req);
    const fingerprint = `${ip}:${body.email}`;

    const rateLimit = await consumeRateLimit(supabase, {
      formKey: "contact",
      fingerprint,
      windowSeconds: 60,
      maxAttempts: 3,
    });

    if (!rateLimit.allowed) {
      console.warn("[submit-contact] rate limited:", { email: body.email, ip });
      return new Response(
        JSON.stringify({ error: "Demasiadas tentativas. Aguarda um minuto e tenta novamente." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const duplicateSince = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: recentDuplicate, error: duplicateError } = await supabase
      .from("contactos")
      .select("id")
      .eq("email", body.email)
      .eq("mensagem", body.mensagem)
      .gte("created_at", duplicateSince)
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      console.error("[submit-contact] duplicate check:", duplicateError.message);
      throw duplicateError;
    }

    if (recentDuplicate) {
      console.info("[submit-contact] duplicate ignored:", { email: body.email, id: recentDuplicate.id });
      return new Response(
        JSON.stringify({ ok: true, duplicate: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { error: insertError } = await supabase
      .from("contactos")
      .insert({
        nome: body.nome,
        email: body.email,
        telefone: body.telefone ?? null,
        mensagem: body.mensagem,
        assunto: body.assunto ?? null,
      });

    if (insertError) {
      console.error("[submit-contact] insert:", insertError.message);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar mensagem. Tenta novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[submit-contact] unexpected:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
