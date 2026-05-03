import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  createInvalidOriginResponse,
  getCorsHeaders,
  isAllowedOrigin,
} from "../_shared/site-config.ts";
import {
  captureException,
  createRequestId,
  logEvent,
} from "../_shared/observability.ts";
import {
  consumeRateLimit,
  getClientIp,
} from "../_shared/public-form-guards.ts";
import { parseTransferOrderRequestBody } from "./validation.ts";

interface RequestBody {
  itemIds: string[];
  customerEmail: string;
  customerName: string;
  customerTelefone?: string;
  customerMorada?: string;
  nif?: string;
  notas?: string;
  metodo_pagamento?: string;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL") ?? "";
    const iban = Deno.env.get("IBAN_ATELIER") ?? "Contactar o atelier para dados bancarios";

    if (!isAllowedOrigin(requestOrigin)) {
      return createInvalidOriginResponse(req);
    }

    if (!supabaseUrl || !supabaseKey) {
      logEvent("error", "create_transfer_order_config_missing", {
        source: "create-transfer-order",
        request_id: requestId,
      });
      return new Response(
        JSON.stringify({ error: "Configuracao do servidor incompleta.", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const rawBody: unknown = await req.json();
    let body: RequestBody;

    try {
      body = parseTransferOrderRequestBody(rawBody);
    } catch (validationErr) {
      logEvent("warn", "create_transfer_order_validation_failed", {
        source: "create-transfer-order",
        request_id: requestId,
        error_message: (validationErr as Error).message,
      });
      return new Response(
        JSON.stringify({ error: (validationErr as Error).message, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { itemIds, customerEmail, customerName } = body;
    const ip = getClientIp(req);

    const rateLimit = await consumeRateLimit(supabase, {
      formKey: "transfer-order",
      fingerprint: `${ip}:${customerEmail}`,
      windowSeconds: 60,
      maxAttempts: 3,
    });

    if (!rateLimit.allowed) {
      logEvent("warn", "create_transfer_order_rate_limited", {
        source: "create-transfer-order",
        request_id: requestId,
        ip,
      });
      return new Response(
        JSON.stringify({ error: "Demasiadas tentativas. Aguarda um minuto e tenta novamente.", requestId }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: obras, error: dbError } = await supabase
      .from("obras")
      .select("id, titulo, preco, estado")
      .in("id", itemIds);

    if (dbError || !obras || obras.length !== itemIds.length) {
      if (dbError) {
        await captureException("create_transfer_order_obras_lookup_failed", dbError, {
          source: "create-transfer-order",
          request_id: requestId,
          obra_ids: itemIds,
        });
      } else {
        logEvent("warn", "create_transfer_order_obras_invalid", {
          source: "create-transfer-order",
          request_id: requestId,
          obra_ids: itemIds,
          requested: itemIds.length,
          found: obras?.length ?? 0,
        });
      }
      return new Response(
        JSON.stringify({ error: "Obras invalidas ou nao encontradas.", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const indisponiveis = obras.filter((o) => o.estado !== "disponivel");
    if (indisponiveis.length > 0) {
      logEvent("warn", "create_transfer_order_obra_indisponivel", {
        source: "create-transfer-order",
        request_id: requestId,
        obra_id: indisponiveis[0].id,
        estado: indisponiveis[0].estado,
      });
      return new Response(
        JSON.stringify({ error: `"${indisponiveis[0].titulo}" ja nao esta disponivel.`, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const total = obras.reduce((acc, o) => acc + (o.preco ?? 0), 0);
    const orderItems = obras.map((o) => ({ id: o.id, titulo: o.titulo, preco: o.preco }));
    const requestedItemIds = [...itemIds].sort();

    const duplicateSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentOrders, error: duplicateError } = await supabase
      .from("vendas")
      .select("id, referencia, items")
      .eq("cliente_email", customerEmail)
      .eq("estado", "pendente")
      .eq("metodo_pagamento", body.metodo_pagamento ?? "transferencia")
      .gte("created_at", duplicateSince)
      .order("created_at", { ascending: false })
      .limit(5);

    if (duplicateError) {
      await captureException("create_transfer_order_duplicate_check_failed", duplicateError, {
        source: "create-transfer-order",
        request_id: requestId,
        obra_ids: itemIds,
      });
      return new Response(
        JSON.stringify({ error: "Erro ao validar pedido. Tenta novamente.", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const duplicateOrder = (recentOrders ?? []).find((order) => {
      const ids = Array.isArray(order.items)
        ? order.items
            .map((item) => (item && typeof item === "object" && "id" in item ? String(item.id) : null))
            .filter((value): value is string => Boolean(value))
            .sort()
        : [];

      return ids.length === requestedItemIds.length && ids.every((id, index) => id === requestedItemIds[index]);
    });

    if (duplicateOrder) {
      logEvent("info", "create_transfer_order_duplicate_ignored", {
        source: "create-transfer-order",
        request_id: requestId,
        venda_id: duplicateOrder.id,
        obra_ids: itemIds,
      });
      return new Response(
        JSON.stringify({ ok: true, duplicate: true, referencia: duplicateOrder.referencia, requestId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const referencia = `ARTE-${Date.now().toString(36).toUpperCase()}`;

    const moradaParts = [body.customerMorada].filter(Boolean);
    if (body.nif) moradaParts.push(`NIF: ${body.nif}`);
    if (body.notas) moradaParts.push(`Notas: ${body.notas}`);

    const { data: insertedVenda, error: insertError } = await supabase
      .from("vendas")
      .insert({
        cliente_nome: customerName,
        cliente_email: customerEmail,
        cliente_tel: body.customerTelefone ?? null,
        morada: moradaParts.join(" | ") || null,
        total,
        items: orderItems,
        estado: "pendente",
        metodo_pagamento: body.metodo_pagamento ?? "transferencia",
        referencia,
      })
      .select("id, referencia")
      .single();

    if (insertError || !insertedVenda) {
      await captureException("create_transfer_order_insert_failed", insertError ?? new Error("Venda nao inserida."), {
        source: "create-transfer-order",
        request_id: requestId,
        obra_ids: itemIds,
      });
      return new Response(
        JSON.stringify({ error: "Erro ao registar pedido. Tenta novamente.", requestId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Atelier Ana Alexandre <noreply@ana-alexandre.pt>",
          to: [customerEmail],
          bcc: notifyEmail ? [notifyEmail] : [],
          reply_to: notifyEmail || undefined,
          subject: "Pedido recebido - Ana Alexandre Atelier",
          html: buildTransferHtml(customerName, total, orderItems, referencia, iban, notifyEmail),
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            await captureException("create_transfer_order_email_failed", new Error(await response.text()), {
              source: "create-transfer-order",
              request_id: requestId,
              venda_id: insertedVenda.id,
              referencia,
            });
          }
        })
        .catch(async (error) => {
          await captureException("create_transfer_order_email_failed", error, {
            source: "create-transfer-order",
            request_id: requestId,
            venda_id: insertedVenda.id,
            referencia,
          });
        });
    } else {
      logEvent("warn", "create_transfer_order_resend_missing", {
        source: "create-transfer-order",
        request_id: requestId,
        venda_id: insertedVenda.id,
        referencia,
      });
    }

    logEvent("info", "create_transfer_order_created", {
      source: "create-transfer-order",
      request_id: requestId,
      venda_id: insertedVenda.id,
      referencia,
      obra_ids: itemIds,
    });

    return new Response(
      JSON.stringify({ ok: true, referencia, requestId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    await captureException("create_transfer_order_unexpected", err, {
      source: "create-transfer-order",
      request_id: requestId,
    });
    return new Response(
      JSON.stringify({ error: (err as Error).message, requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildTransferHtml(
  name: string,
  total: number,
  items: Array<{ titulo: string; preco: number | null }>,
  referencia: string,
  iban: string,
  atelierEmail: string,
): string {
  const totalFmt = total.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const itemsHtml = items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 0;color:#1a1a1a;font-size:13px;border-bottom:1px solid #f0ede8">${esc(i.titulo)}</td>
      <td style="padding:8px 0;color:#C4956A;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #f0ede8">
        €${(i.preco ?? 0).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
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
        Olá <strong>${esc(name)}</strong>,<br>
        Recebemos o teu pedido por Transferência Bancária. Segue em baixo o resumo e os dados para pagamento.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        ${itemsHtml}
        <tr>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#1a1a1a">Total</td>
          <td style="padding:12px 0 0;font-size:14px;font-weight:600;color:#C4956A;text-align:right">€${totalFmt}</td>
        </tr>
      </table>
      <div style="background:#faf8f5;border-radius:8px;border-left:3px solid #C4956A;padding:16px 20px;margin-bottom:20px">
        <p style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 10px">Dados para Transferência</p>
        <p style="color:#1a1a1a;font-size:13px;line-height:1.9;margin:0">
          <strong>IBAN:</strong> ${esc(iban)}<br>
          <strong>Titular:</strong> Ana Alexandre<br>
          <strong>Referência:</strong>
          <span style="font-family:monospace;background:#f0ede8;padding:2px 8px;border-radius:4px;font-size:12px">${esc(referencia)}</span>
        </p>
      </div>
      <p style="color:#64748b;font-size:13px;line-height:1.7;margin:0 0 28px">
        Usa <strong>${esc(referencia)}</strong> como referência na transferência para podermos identificar o teu pagamento.<br>
        Após confirmação do pagamento, entraremos em contacto para tratar do envio.
        ${atelierEmail ? `Qualquer questão: <a href="mailto:${esc(atelierEmail)}" style="color:#C4956A">${esc(atelierEmail)}</a>.` : ""}
      </p>
    </div>
    <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #f0ede8">
      <p style="color:#94a3b8;font-size:11px;margin:0">Ana Alexandre · Atelier de Arte · Tomar, Portugal</p>
    </div>
  </div>
</body>
</html>`;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}
