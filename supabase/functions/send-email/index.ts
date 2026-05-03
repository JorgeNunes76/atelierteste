import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createInvalidOriginResponse,
  getCanonicalSiteUrl,
  getCorsHeaders,
  isAllowedOrigin,
} from "../_shared/site-config.ts";
import {
  captureException,
  createRequestId,
  logEvent,
} from "../_shared/observability.ts";

interface EmailPayload {
  to: string;
  subject: string;
  customerName: string;
  type: "transfer_order" | "contact_confirmation";
  data?: Record<string, unknown>;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const requestOrigin = req.headers.get("origin");
  const publicSiteUrl = getCanonicalSiteUrl();
  const requestId = createRequestId();

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(requestOrigin)) {
      return createInvalidOriginResponse(req);
    }
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL") ?? "";

    if (!isAllowedOrigin(requestOrigin)) {
      return createInvalidOriginResponse(req);
    }

    if (!resendKey) {
      logEvent("error", "send_email_config_missing", {
        source: "send-email",
        request_id: requestId,
      });
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.type) {
      logEvent("warn", "send_email_invalid_payload", {
        source: "send-email",
        request_id: requestId,
        email_type: payload.type,
      });
      return new Response(
        JSON.stringify({ error: "to and type are required", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let html = "";
    let subject = payload.subject;

    if (payload.type === "transfer_order") {
      const total = (payload.data?.total as number) ?? 0;
      const items = (payload.data?.items as Array<{ titulo: string; preco: number }>) ?? [];
      const iban = Deno.env.get("IBAN_ATELIER") ?? "Contactar atelier para dados bancarios";
      html = buildTransferOrderHtml(payload.customerName, total, items, notifyEmail, iban);
      subject = subject || "Pedido recebido - Ana Alexandre Atelier";
    } else if (payload.type === "contact_confirmation") {
      html = buildContactConfirmationHtml(payload.customerName, publicSiteUrl);
      subject = subject || "Mensagem recebida - Ana Alexandre Atelier";
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
        to: [payload.to],
        bcc: notifyEmail ? [notifyEmail] : [],
        reply_to: notifyEmail || undefined,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      await captureException("send_email_resend_failed", new Error(await res.text()), {
        source: "send-email",
        request_id: requestId,
        email_type: payload.type,
      });
      return new Response(JSON.stringify({ error: "Email send failed", requestId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logEvent("info", "send_email_sent", {
      source: "send-email",
      request_id: requestId,
      email_type: payload.type,
    });

    return new Response(JSON.stringify({ ok: true, requestId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    await captureException("send_email_unexpected", err, {
      source: "send-email",
      request_id: requestId,
    });
    return new Response(JSON.stringify({ error: (err as Error).message, requestId }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildTransferOrderHtml(
  name: string,
  total: number,
  items: Array<{ titulo: string; preco: number }>,
  atelierEmail: string,
  iban: string,
): string {
  const totalFmt = total.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#1a1a1a;font-size:13px;border-bottom:1px solid #f0ede8">
          ${escHtml(i.titulo)}
        </td>
        <td style="padding:8px 0;color:#C4956A;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8">
          €${i.preco.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
        </td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">Ana Alexandre · Atelier</p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0">Pedido recebido</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 24px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        Recebemos o teu pedido por Transferência Bancária. Segue em baixo o resumo.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#1a1a1a">Total</td>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#C4956A;text-align:right">€${totalFmt}</td>
        </tr>
      </table>
      <div style="background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A;padding:16px 20px;margin-bottom:24px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 8px">Dados para Transferência</p>
        <p style="color:#1a1a1a;font-size:13px;line-height:1.8;margin:0">
          <strong>IBAN:</strong> ${escHtml(iban)}<br>
          <strong>Titular:</strong> Ana Alexandre<br>
          <strong>Referência:</strong> ARTE-${Date.now().toString(36).toUpperCase()}
        </p>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Após confirmarmos o pagamento, entraremos em contacto para tratar do envio da obra.
        Qualquer dúvida, responde a este email ou contacta-nos em
        <a href="mailto:${escHtml(atelierEmail)}" style="color:#C4956A">${escHtml(atelierEmail)}</a>.
      </p>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0">Ana Alexandre · Atelier de Arte · Tomar, Portugal</p>
    </div>
  </div>
</body>
</html>`;
}

function buildContactConfirmationHtml(name: string, publicSiteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f5f3ef;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#2C2318,#3A2D18);padding:28px 32px">
      <p style="color:#C4956A;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 8px">Ana Alexandre · Atelier</p>
      <h1 style="color:#fff;font-size:1.3rem;font-weight:400;margin:0">Mensagem recebida ✓</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.7;margin:0 0 16px">
        Olá <strong>${escHtml(name)}</strong>,<br>
        Obrigada pela tua mensagem. Responderei o mais brevemente possível.
      </p>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Habitualmente respondo em 24-48 horas úteis.
      </p>
      <a href="${publicSiteUrl}"
        style="display:inline-block;padding:12px 28px;background:#C4956A;color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
        Visitar Atelier
      </a>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0">Ana Alexandre · Atelier de Arte · Tomar, Portugal</p>
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
