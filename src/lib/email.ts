/**
 * Utilitários de comunicação client-side com Edge Functions.
 * Nenhuma chave secreta (RESEND_API_KEY, service role) é exposta no bundle.
 */

import { captureClientError } from "./observability";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface TransferOrderParams {
  itemIds: string[];
  customerEmail: string;
  customerName: string;
  customerTelefone?: string;
  customerMorada?: string;
  nif?: string;
  notas?: string;
}

/**
 * Submete um pedido por transferência bancária.
 * A Edge Function valida os items, calcula o total real,
 * persiste a venda e envia o email de confirmação.
 */
export async function submitTransferOrder(
  params: TransferOrderParams,
  options?: { signal?: AbortSignal },
): Promise<void> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/create-transfer-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(params),
      signal: options?.signal,
    });

    if (!res.ok) {
      let msg = "Erro ao submeter pedido.";
      try {
        const body = await res.json();
        msg = body.error ?? msg;
      } catch {
        // ignore
      }

      const transferError = new Error(msg);
      captureClientError(transferError, {
        source: "frontend.transfer_order.submit_failed",
        tags: { status_code: res.status, item_count: params.itemIds.length },
        context: { obra_ids: params.itemIds },
      });
      throw transferError;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    captureClientError(error, {
      source: "frontend.transfer_order.submit_exception",
      tags: { item_count: params.itemIds.length },
      context: { obra_ids: params.itemIds },
    });
    throw error;
  }
}
