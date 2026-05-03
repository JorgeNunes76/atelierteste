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
} from "../_shared/public-form-guards.ts";
import {
  captureException,
  createRequestId,
  logEvent,
} from "../_shared/observability.ts";

interface ClientErrorPayload {
  source: string;
  message: string;
  stack?: string;
  route?: string;
  request_id?: string;
  client_session_id?: string;
  component_stack?: string;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function truncate(value: unknown, max = 2000): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? `${trimmed.slice(0, max - 3)}...` : trimmed;
}

function parsePayload(payload: unknown): ClientErrorPayload {
  if (!isPlainObject(payload)) throw new Error("Payload inválido.");

  const source = truncate(payload.source, 120);
  const message = truncate(payload.message, 1000);
  if (!source || !message) {
    throw new Error("source e message são obrigatórios.");
  }

  const tags = isPlainObject(payload.tags) ? payload.tags : undefined;
  const context = isPlainObject(payload.context) ? payload.context : undefined;

  return {
    source,
    message,
    stack: truncate(payload.stack, 6000),
    route: truncate(payload.route, 500),
    request_id: truncate(payload.request_id, 120),
    client_session_id: truncate(payload.client_session_id, 120),
    component_stack: truncate(payload.component_stack, 6000),
    tags,
    context,
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const requestOrigin = req.headers.get("origin");
  const requestId = createRequestId();

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
        JSON.stringify({ error: "Configuração do servidor incompleta.", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ip = getClientIp(req);
    const rateLimit = await consumeRateLimit(supabase, {
      formKey: "client-error",
      fingerprint: ip,
      windowSeconds: 60,
      maxAttempts: 20,
    });

    if (!rateLimit.allowed) {
      logEvent("warn", "client_error_rate_limited", {
        source: "report-client-error",
        request_id: requestId,
        ip,
      });
      return new Response(
        JSON.stringify({ ok: true, requestId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = parsePayload(await req.json());
    await captureException(
      "client_error_reported",
      new Error(payload.message),
      {
        source: "report-client-error",
        request_id: payload.request_id ?? requestId,
        route: payload.route,
        client_session_id: payload.client_session_id,
        browser_source: payload.source,
        tags: payload.tags,
        context: payload.context,
        component_stack: payload.component_stack,
        stack: payload.stack,
      },
    );

    return new Response(
      JSON.stringify({ ok: true, requestId: payload.request_id ?? requestId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    await captureException("client_error_endpoint_failed", err, {
      source: "report-client-error",
      request_id: requestId,
    });
    return new Response(
      JSON.stringify({ ok: false, requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

