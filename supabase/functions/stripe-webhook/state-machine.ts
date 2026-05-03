export type VendaEstado = "pendente" | "pago" | "enviado" | "cancelado" | string;

export function isPaidCheckoutSessionState(
  session: { payment_status?: string | null; status?: string | null },
): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}

export type CompletedAction = "promote_to_paid" | "ensure_sold" | "ignore_not_paid" | "no_transition";

export function decideCompletedAction(params: {
  vendaEstado: VendaEstado;
  sessionPaid: boolean;
}): CompletedAction {
  const { vendaEstado, sessionPaid } = params;

  if (vendaEstado === "pago") return "ensure_sold";
  if (!sessionPaid) return "ignore_not_paid";
  if (vendaEstado === "pendente" || vendaEstado === "cancelado") return "promote_to_paid";
  return "no_transition";
}

export type ExpiredAction = "ignore_paid_session" | "cancel_and_release" | "ensure_sold" | "no_transition";

export function decideExpiredAction(params: {
  vendaEstado: VendaEstado;
  sessionPaid: boolean;
}): ExpiredAction {
  const { vendaEstado, sessionPaid } = params;

  if (sessionPaid) return "ignore_paid_session";
  if (vendaEstado === "pago") return "ensure_sold";
  if (vendaEstado === "pendente") return "cancel_and_release";
  return "no_transition";
}
