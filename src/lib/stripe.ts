import { captureClientError } from "./observability";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Chama a Edge Function `create-checkout-session`.
 * A função valida os items, calcula o total real, reserva as obras atomicamente
 * e cria a sessão Stripe. O utilizador é redirecionado para o Stripe Checkout.
 */
export async function createStripeCheckoutSession(
  itemIds: string[],
  customerInfo: {
    email: string;
    nome: string;
    telefone?: string;
    morada?: string;
    nif?: string;
    notas?: string;
  },
  options?: { signal?: AbortSignal },
): Promise<void> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        itemIds,
        customerEmail: customerInfo.email,
        customerName: customerInfo.nome,
        customerTelefone: customerInfo.telefone,
        customerMorada: customerInfo.morada,
        nif: customerInfo.nif,
        notas: customerInfo.notas,
      }),
      signal: options?.signal,
    });

    if (!res.ok) {
      let errMsg = "Falha ao criar sessão de pagamento";
      try {
        const err = await res.json();
        errMsg = err.error ?? errMsg;
      } catch {
        // ignore
      }

      const checkoutError = new Error(errMsg);
      captureClientError(checkoutError, {
        source: "frontend.checkout.create_session_failed",
        tags: { status_code: res.status, item_count: itemIds.length },
        context: { obra_ids: itemIds },
      });
      throw checkoutError;
    }

    const { url } = await res.json();
    if (!url || typeof url !== "string") {
      throw new Error("URL de pagamento não recebido do servidor");
    }

    if (!url.startsWith("https://checkout.stripe.com")) {
      throw new Error("URL de checkout inválido recebida do servidor");
    }

    window.location.href = url;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    captureClientError(error, {
      source: "frontend.checkout.redirect_failed",
      tags: { item_count: itemIds.length },
      context: { obra_ids: itemIds },
    });
    throw error;
  }
}
