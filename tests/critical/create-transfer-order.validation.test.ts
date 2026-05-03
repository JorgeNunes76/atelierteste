import { describe, expect, it } from "vitest";
import { parseTransferOrderRequestBody } from "../../supabase/functions/create-transfer-order/validation";

describe("create-transfer-order payload validation", () => {
  const validPayload = {
    itemIds: ["obra-1", "obra-2"],
    customerEmail: "CLIENTE@EXAMPLE.COM",
    customerName: "Cliente",
    metodo_pagamento: "transferencia",
  };

  it("accepts a valid payload and normalizes email", () => {
    const parsed = parseTransferOrderRequestBody(validPayload);
    expect(parsed.customerEmail).toBe("cliente@example.com");
    expect(parsed.metodo_pagamento).toBe("transferencia");
  });

  it("rejects forbidden internal fields", () => {
    expect(() =>
      parseTransferOrderRequestBody({
        ...validPayload,
        estado: "pago",
      }),
    ).toThrow(/campos internos proibidos/i);
  });

  it("rejects unexpected fields", () => {
    expect(() =>
      parseTransferOrderRequestBody({
        ...validPayload,
        role: "admin",
      }),
    ).toThrow(/campos inesperados/i);
  });

  it("rejects non-whitelisted payment method", () => {
    expect(() =>
      parseTransferOrderRequestBody({
        ...validPayload,
        metodo_pagamento: "cartao",
      }),
    ).toThrow(/metodo_pagamento invalido/i);
  });

  it("rejects duplicate itemIds", () => {
    expect(() =>
      parseTransferOrderRequestBody({
        ...validPayload,
        itemIds: ["obra-1", "obra-1"],
      }),
    ).toThrow(/itemIds contem duplicados/i);
  });
});
