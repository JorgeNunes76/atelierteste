import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCanonicalSiteUrl } from "../_shared/site-config.ts";
import {
  captureException,
  createRequestId,
  logEvent,
} from "../_shared/observability.ts";
import {
  decideCompletedAction,
  decideExpiredAction,
  isPaidCheckoutSessionState,
} from "./state-machine.ts";

type VendaRow = {
  id: string;
  cliente_email: string;
  cliente_nome: string;
  email_estado: string | null;
  estado: string;
  items: Array<{ id: string }>;
  stripe_session_id: string | null;
};

async function markObrasAsSold(
  supabase: ReturnType<typeof createClient>,
  itemIds: string[],
  context: Record<string, unknown>,
) {
  if (itemIds.length === 0) return;

  const { error } = await supabase
    .from("obras")
    .update({ estado: "vendido", reserved_until: null })
    .in("id", itemIds);

  if (error) {
    await captureException("stripe_webhook_mark_obras_sold_failed", error, {
      ...context,
      obra_ids: itemIds,
    });
  }
}

async function releaseReservedObras(
  supabase: ReturnType<typeof createClient>,
  itemIds: string[],
  context: Record<string, unknown>,
) {
  if (itemIds.length === 0) return;

  const { error } = await supabase
    .from("obras")
    .update({ estado: "disponivel", reserved_until: null })
    .in("id", itemIds)
    .eq("estado", "reservado");

  if (error) {
    await captureException("stripe_webhook_release_obras_failed", error, {
      ...context,
      obra_ids: itemIds,
    });
  }
}

async function findVendaForSession(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  vendaId: string | undefined,
  context: Record<string, unknown>,
): Promise<VendaRow | null> {
  const { data: bySession, error: sessionError } = await supabase
    .from("vendas")
    .select("id, cliente_email, cliente_nome, email_estado, estado, items, stripe_session_id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle<VendaRow>();

  if (sessionError) {
    await captureException("stripe_webhook_lookup_by_session_failed", sessionError, {
      ...context,
      stripe_session_id: sessionId,
      venda_id: vendaId,
    });
    return null;
  }

  if (bySession) return bySession;
  if (!vendaId) return null;

  const { data: byId, error: idError } = await supabase
    .from("vendas")
    .select("id, cliente_email, cliente_nome, email_estado, estado, items, stripe_session_id")
    .eq("id", vendaId)
    .maybeSingle<VendaRow>();

  if (idError) {
    await captureException("stripe_webhook_lookup_by_id_failed", idError, {
      ...context,
      stripe_session_id: sessionId,
      venda_id: vendaId,
    });
    return null;
  }

  if (byId) {
    logEvent("warn", "stripe_webhook_metadata_fallback_used", {
      ...context,
      venda_id: vendaId,
      stripe_session_id: sessionId,
      current_stripe_session_id: byId.stripe_session_id,
    });
  }

  return byId;
}

async function claimReceiptEmailSend(
  supabase: ReturnType<typeof createClient>,
  vendaId: string,
  context: Record<string, unknown>,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("vendas")
    .update({ email_estado: "enviando" })
    .eq("id", vendaId)
    .or("email_estado.is.null,email_estado.eq.pendente,email_estado.eq.retry_needed")
    .select("id")
    .maybeSingle();

  if (error) {
    await captureException("stripe_webhook_email_claim_failed", error, {
      ...context,
      venda_id: vendaId,
    });
    return false;
  }

  return Boolean(data);
}

async function setReceiptEmailState(
  supabase: ReturnType<typeof createClient>,
  vendaId: string,
  emailEstado: "enviado" | "retry_needed",
  context: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("vendas")
    .update({ email_estado: emailEstado })
    .eq("id", vendaId);

  if (error) {
    await captureException("stripe_webhook_email_state_update_failed", error, {
      ...context,
      venda_id: vendaId,
      email_estado: emailEstado,
    });
  }
}

serve(async (req) => {
  const requestId = createRequestId();
  const baseContext = {
    source: "stripe-webhook",
    request_id: requestId,
  };

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL") ?? "";

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const supabase = createClient(supabaseUrl, supabaseKey);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    logEvent("error", "stripe_webhook_missing_signature", baseContext);
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    await captureException("stripe_webhook_signature_failed", err, baseContext);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const eventContext = {
    ...baseContext,
    stripe_event_id: event.id,
    stripe_event_type: event.type,
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const vendaId = session.metadata?.venda_id;
    const amountPaid = (session.amount_total ?? 0) / 100;
    const sessionContext = {
      ...eventContext,
      stripe_session_id: session.id,
      venda_id: vendaId,
    };
    let vendaForEmail: VendaRow | null = null;

    if (vendaId || session.id) {
      const venda = await findVendaForSession(supabase, session.id, vendaId, sessionContext);

      if (!venda) {
        logEvent("warn", "stripe_webhook_completed_venda_missing", sessionContext);
      } else if (venda.stripe_session_id && venda.stripe_session_id !== session.id) {
        logEvent("warn", "stripe_webhook_completed_session_mismatch", {
          ...sessionContext,
          venda_id: venda.id,
          expected: venda.stripe_session_id,
          received: session.id,
        });
      } else if (decideCompletedAction({
        vendaEstado: venda.estado,
        sessionPaid: isPaidCheckoutSessionState(session),
      }) === "ensure_sold") {
        await markObrasAsSold(supabase, (venda.items ?? []).map((i) => i.id), {
          ...sessionContext,
          venda_id: venda.id,
        });
        vendaForEmail = venda;
      } else if (decideCompletedAction({
        vendaEstado: venda.estado,
        sessionPaid: isPaidCheckoutSessionState(session),
      }) === "promote_to_paid") {
        const { data: vendaData, error } = await supabase
          .from("vendas")
          .update({
            email_estado: venda.email_estado ?? "pendente",
            estado: "pago",
            stripe_session_id: session.id,
          })
          .eq("id", venda.id)
          .in("estado", ["pendente", "cancelado"])
          .select("id, cliente_email, cliente_nome, email_estado, items, stripe_session_id, estado")
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            await captureException("stripe_webhook_completed_update_failed", error, {
              ...sessionContext,
              venda_id: venda.id,
            });
          }
        } else {
          const itemIds = ((vendaData?.items ?? []) as Array<{ id: string }>).map((i) => i.id);
          await markObrasAsSold(supabase, itemIds, {
            ...sessionContext,
            venda_id: venda.id,
          });
          vendaForEmail = vendaData as VendaRow;
          logEvent("info", "stripe_webhook_completed_processed", {
            ...sessionContext,
            venda_id: venda.id,
            obra_ids: itemIds,
          });
        }
      } else {
        logEvent("warn", "stripe_webhook_completed_not_paid", {
          ...sessionContext,
          venda_id: venda.id,
          payment_status: session.payment_status,
          status: session.status,
        });
      }
    }

    const customerEmail = session.customer_email ?? session.customer_details?.email ?? vendaForEmail?.cliente_email ?? null;
    const customerName = session.customer_details?.name ?? vendaForEmail?.cliente_nome ?? "Cliente";

    if (vendaForEmail && resendKey && customerEmail) {
      const claimedEmailSend = await claimReceiptEmailSend(supabase, vendaForEmail.id, {
        ...sessionContext,
        venda_id: vendaForEmail.id,
      });
      if (!claimedEmailSend) {
        logEvent("info", "stripe_webhook_email_skip_already_processing", {
          ...sessionContext,
          venda_id: vendaForEmail.id,
        });
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
          to: [customerEmail],
          bcc: [notifyEmail],
          reply_to: notifyEmail,
          subject: "Confirmacao de pagamento - Ana Alexandre Atelier",
          html: buildReceiptHtml(customerName, amountPaid, session.id),
        }),
      });

      if (!emailRes.ok) {
        await captureException("stripe_webhook_receipt_email_failed", new Error(await emailRes.text()), {
          ...sessionContext,
          venda_id: vendaForEmail.id,
          email_estado: "retry_needed",
        });
        await setReceiptEmailState(supabase, vendaForEmail.id, "retry_needed", {
          ...sessionContext,
          venda_id: vendaForEmail.id,
        });
      } else {
        await setReceiptEmailState(supabase, vendaForEmail.id, "enviado", {
          ...sessionContext,
          venda_id: vendaForEmail.id,
        });
      }
    } else if (vendaForEmail && !resendKey) {
      logEvent("warn", "stripe_webhook_resend_missing_retry_needed", {
        ...sessionContext,
        venda_id: vendaForEmail.id,
      });
      await setReceiptEmailState(supabase, vendaForEmail.id, "retry_needed", {
        ...sessionContext,
        venda_id: vendaForEmail.id,
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const vendaId = session.metadata?.venda_id;
    const sessionContext = {
      ...eventContext,
      stripe_session_id: session.id,
      venda_id: vendaId,
    };

    if (!vendaId) {
      logEvent("warn", "stripe_webhook_expired_missing_venda_id", sessionContext);
    } else {
      const latestSession = await stripe.checkout.sessions.retrieve(session.id);
      const expiredAction = decideExpiredAction({
        vendaEstado: "pendente",
        sessionPaid: isPaidCheckoutSessionState(latestSession),
      });

      if (expiredAction === "ignore_paid_session") {
        logEvent("warn", "stripe_webhook_expired_paid_session_ignored", sessionContext);
      } else {
        const venda = await findVendaForSession(supabase, session.id, vendaId, sessionContext);

        if (!venda) {
          logEvent("warn", "stripe_webhook_expired_venda_missing", sessionContext);
        } else if (venda.stripe_session_id && venda.stripe_session_id !== session.id) {
          logEvent("warn", "stripe_webhook_expired_session_mismatch", {
            ...sessionContext,
            venda_id: venda.id,
            expected: venda.stripe_session_id,
            received: session.id,
          });
        } else if (decideExpiredAction({
          vendaEstado: venda.estado,
          sessionPaid: false,
        }) === "ensure_sold") {
          await markObrasAsSold(supabase, (venda.items ?? []).map((i) => i.id), {
            ...sessionContext,
            venda_id: venda.id,
          });
        } else if (decideExpiredAction({
          vendaEstado: venda.estado,
          sessionPaid: false,
        }) === "cancel_and_release") {
          const { data: cancelledVenda, error: vendaError } = await supabase
            .from("vendas")
            .update({ estado: "cancelado" })
            .eq("id", venda.id)
            .eq("estado", "pendente")
            .select("id, items")
            .single();

          if (vendaError && vendaError.code !== "PGRST116") {
            await captureException("stripe_webhook_expired_cancel_failed", vendaError, {
              ...sessionContext,
              venda_id: venda.id,
            });
          }

          if (cancelledVenda) {
            const itemIds = ((cancelledVenda.items ?? []) as Array<{ id: string }>).map((i) => i.id);
            await releaseReservedObras(supabase, itemIds, {
              ...sessionContext,
              venda_id: venda.id,
            });
            logEvent("info", "stripe_webhook_expired_released", {
              ...sessionContext,
              venda_id: venda.id,
              obra_ids: itemIds,
            });
          }
        } else {
          logEvent("info", "stripe_webhook_expired_no_transition", {
            ...sessionContext,
            venda_id: venda.id,
            estado_atual: venda.estado,
          });
        }
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    logEvent("warn", "stripe_webhook_payment_intent_failed", {
      ...eventContext,
      stripe_payment_intent_id: pi.id,
      error_message: pi.last_payment_error?.message,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

function buildReceiptHtml(name: string, amount: number, sessionId: string): string {
  const publicSiteUrl = getCanonicalSiteUrl();
  const amountFormatted = amount.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">
        Ana Alexandre · Atelier
      </p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0;line-height:1.3">
        Pagamento confirmado ✓
      </h1>
    </div>
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 24px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        O teu pagamento de
        <strong style="color:#C4956A">€${amountFormatted}</strong>
        foi recebido com sucesso. Obrigada pela tua confiança!
      </p>
      <div style="background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A;padding:16px 20px;margin-bottom:24px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 6px">
          Referência da transação
        </p>
        <p style="color:#1a1a1a;font-size:12px;font-family:monospace;margin:0;word-break:break-all">
          ${escHtml(sessionId)}
        </p>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Entraremos em contacto brevemente para confirmar os detalhes de envio da obra.
        Se tiveres alguma questão, responde a este email.
      </p>
      <a href="${publicSiteUrl}/galeria"
        style="display:inline-block;padding:12px 28px;background:#C4956A;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.05em">
        Ver Galeria
      </a>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0;line-height:1.6">
        Ana Alexandre · Atelier de Arte Contemporânea · Tomar, Portugal
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}
