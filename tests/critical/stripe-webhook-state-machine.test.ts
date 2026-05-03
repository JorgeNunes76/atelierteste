import { describe, expect, it } from "vitest";
import {
  decideCompletedAction,
  decideExpiredAction,
  isPaidCheckoutSessionState,
} from "../../supabase/functions/stripe-webhook/state-machine";

describe("stripe webhook state machine", () => {
  it("treats paid or complete session as paid", () => {
    expect(isPaidCheckoutSessionState({ payment_status: "paid", status: "open" })).toBe(true);
    expect(isPaidCheckoutSessionState({ payment_status: "unpaid", status: "complete" })).toBe(true);
    expect(isPaidCheckoutSessionState({ payment_status: "unpaid", status: "open" })).toBe(false);
  });

  it("completed promotes pending/cancelado to pago when session is paid", () => {
    expect(decideCompletedAction({ vendaEstado: "pendente", sessionPaid: true })).toBe("promote_to_paid");
    expect(decideCompletedAction({ vendaEstado: "cancelado", sessionPaid: true })).toBe("promote_to_paid");
  });

  it("completed is idempotent for already paid venda", () => {
    expect(decideCompletedAction({ vendaEstado: "pago", sessionPaid: true })).toBe("ensure_sold");
  });

  it("completed ignores unpaid session", () => {
    expect(decideCompletedAction({ vendaEstado: "pendente", sessionPaid: false })).toBe("ignore_not_paid");
  });

  it("expired never releases stock for paid session", () => {
    expect(decideExpiredAction({ vendaEstado: "pendente", sessionPaid: true })).toBe("ignore_paid_session");
    expect(decideExpiredAction({ vendaEstado: "pago", sessionPaid: true })).toBe("ignore_paid_session");
  });

  it("expired cancels and releases only pending non-paid venda", () => {
    expect(decideExpiredAction({ vendaEstado: "pendente", sessionPaid: false })).toBe("cancel_and_release");
    expect(decideExpiredAction({ vendaEstado: "pago", sessionPaid: false })).toBe("ensure_sold");
    expect(decideExpiredAction({ vendaEstado: "cancelado", sessionPaid: false })).toBe("no_transition");
  });
});
