// Supabase Edge Function - Stripe Checkout Session
// Deploy: npx supabase functions deploy create-checkout-session
// Secrets necessarios:
//   STRIPE_SECRET_KEY, SITE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Fluxo transacional:
//   1. RPC reserve_obras_and_create_venda (transaccao ACID unica)
//   2. Criar sessao Stripe com expires_at = +30 min
//   3. Em caso de falha Stripe - rollback manual
//   4. Persistir stripe_session_id na venda

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createInvalidOriginResponse,
  getCorsHeaders,
  isAllowedOrigin,
  resolveSiteUrlForRequest,
} from "../_shared/site-config.ts";
import {
  captureException,
  createRequestId,
  logEvent,
} from "../_shared/observability.ts";

interface RequestBody {
  itemIds: string[];
  customerEmail: string;
  customerName: string;
  customerTelefone?: string;
  customerMorada?: string;
  nif?: string;
  notas?: string;
}

type ReservedItem = { id: string; titulo: string; preco: number | null };

type ReservationResult = {
  venda_id: string;
  total: number;
  items: ReservedItem[];
};

async function rollbackReservation(
  supabase: ReturnType<typeof createClient>,
  itemIds: string[],
  vendaId: string,
  requestId?: string,
) {
  const [{ error: obrasError }, { error: vendaError }] = await Promise.all([
    supabase
      .from("obras")
      .update({ estado: "disponivel", reserved_until: null })
      .in("id", itemIds),
    supabase
      .from("vendas")
      .update({ estado: "cancelado" })
      .eq("id", vendaId)
      .eq("estado", "pendente"),
  ]);

  if (obrasError) {
    await captureException("create_checkout_session_rollback_obras_failed", obrasError, {
      source: "create-checkout-session",
      request_id: requestId,
      venda_id: vendaId,
      obra_ids: itemIds,
    });
  }

  if (vendaError) {
    await captureException("create_checkout_session_rollback_venda_failed", vendaError, {
      source: "create-checkout-session",
      request_id: requestId,
      venda_id: vendaId,
      obra_ids: itemIds,
    });
  }
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const siteUrl = resolveSiteUrlForRequest(req);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!isAllowedOrigin(requestOrigin)) {
      logEvent("warn", "create_checkout_session_invalid_origin", {
        source: "create-checkout-session",
        request_id: requestId,
        origin: requestOrigin,
      });
      return createInvalidOriginResponse(req);
    }

    if (!stripeKey || !supabaseUrl || !supabaseKey) {
      logEvent("error", "create_checkout_session_config_missing", {
        source: "create-checkout-session",
        request_id: requestId,
      });
      return new Response(
        JSON.stringify({ error: "Configuracao do servidor incompleta. Faltam secrets.", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: RequestBody = await req.json();

    const itemIds = body.itemIds ?? ((body as any).items as string[]);
    const customerEmail = body.customerEmail;

    if (!itemIds?.length || !customerEmail) {
      logEvent("warn", "create_checkout_session_invalid_payload", {
        source: "create-checkout-session",
        request_id: requestId,
        obra_ids: itemIds,
      });
      return new Response(
        JSON.stringify({ error: "Faltam itemIds ou email do cliente.", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const moradaParts = [body.customerMorada].filter(Boolean);
    if (body.nif) moradaParts.push(`NIF: ${body.nif}`);
    if (body.notas) moradaParts.push(`Notas: ${body.notas}`);

    const { data: reservation, error: rpcError } = await supabase.rpc(
      "reserve_obras_and_create_venda",
      {
        p_item_ids: itemIds,
        p_customer_nome: body.customerName || "Cliente",
        p_customer_email: customerEmail,
        p_customer_tel: body.customerTelefone ?? "",
        p_morada: moradaParts.join(" | "),
        p_metodo_pagamento: "card",
      },
    );

    if (rpcError || !reservation) {
      logEvent("warn", "create_checkout_session_reservation_failed", {
        source: "create-checkout-session",
        request_id: requestId,
        obra_ids: itemIds,
        error_message: rpcError?.message,
      });
      return new Response(
        JSON.stringify({ error: rpcError?.message ?? "Erro ao reservar obras.", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { venda_id: vendaId, items: reservedItems } = reservation as ReservationResult;

    const lineItems = reservedItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.titulo },
        unit_amount: Math.round((item.preco ?? 0) * 100),
      },
      quantity: 1,
    }));

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: customerEmail,
        success_url: `${siteUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout`,
        metadata: { venda_id: vendaId },
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: ["PT", "ES", "FR", "DE", "IT", "GB", "NL", "BE"],
        },
        locale: "pt",
        payment_intent_data: {
          description: `Ana Alexandre Atelier - ${reservedItems.map((i) => i.titulo).join(", ")}`,
        },
      });
    } catch (stripeErr) {
      await captureException("create_checkout_session_stripe_session_create_failed", stripeErr, {
        source: "create-checkout-session",
        request_id: requestId,
        venda_id: vendaId,
        obra_ids: itemIds,
      });
      await rollbackReservation(supabase, itemIds, vendaId, requestId);
      throw stripeErr;
    }

    const { error: stripeSessionError } = await supabase
      .from("vendas")
      .update({ stripe_session_id: session.id })
      .eq("id", vendaId)
      .eq("estado", "pendente");

    if (stripeSessionError) {
      await captureException("create_checkout_session_persist_session_failed", stripeSessionError, {
        source: "create-checkout-session",
        request_id: requestId,
        venda_id: vendaId,
        obra_ids: itemIds,
        stripe_session_id: session.id,
      });

      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (expireErr) {
        await captureException("create_checkout_session_expire_failed", expireErr, {
          source: "create-checkout-session",
          request_id: requestId,
          venda_id: vendaId,
          stripe_session_id: session.id,
        });
      }

      await rollbackReservation(supabase, itemIds, vendaId, requestId);
      throw new Error("Erro ao associar a sessao de pagamento. Tenta novamente.");
    }

    logEvent("info", "create_checkout_session_created", {
      source: "create-checkout-session",
      request_id: requestId,
      venda_id: vendaId,
      stripe_session_id: session.id,
      obra_ids: itemIds,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url, requestId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    await captureException("create_checkout_session_unexpected", err, {
      source: "create-checkout-session",
      request_id: requestId,
    });
    return new Response(
      JSON.stringify({ error: (err as Error).message, requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
