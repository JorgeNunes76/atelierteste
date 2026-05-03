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

const ALLOWED_PAYMENT_METHODS = new Set(["transferencia"]);
const FORBIDDEN_FIELDS = new Set([
  "total",
  "estado",
  "items",
  "stripe_session_id",
  "referencia",
  "email_estado",
  "created_at",
  "id",
]);
const ALLOWED_FIELDS = new Set([
  "itemIds",
  "customerEmail",
  "customerName",
  "customerTelefone",
  "customerMorada",
  "nif",
  "notas",
  "metodo_pagamento",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function parseTransferOrderRequestBody(payload: unknown): RequestBody {
  if (!isPlainObject(payload)) {
    throw new Error("Payload invalido.");
  }

  const keys = Object.keys(payload);
  const forbiddenKeys = keys.filter((key) => FORBIDDEN_FIELDS.has(key));
  if (forbiddenKeys.length > 0) {
    throw new Error(`Payload contem campos internos proibidos: ${forbiddenKeys.join(", ")}`);
  }

  const unexpectedKeys = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unexpectedKeys.length > 0) {
    throw new Error(`Payload contem campos inesperados: ${unexpectedKeys.join(", ")}`);
  }

  const itemIds = payload.itemIds;
  const customerEmail = payload.customerEmail;
  const customerName = payload.customerName;
  const metodoPagamento = payload.metodo_pagamento;

  if (!Array.isArray(itemIds) || itemIds.length === 0 || itemIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw new Error("itemIds invalido.");
  }

  if (new Set(itemIds).size !== itemIds.length) {
    throw new Error("itemIds contem duplicados.");
  }

  if (typeof customerEmail !== "string" || !customerEmail.trim()) {
    throw new Error("customerEmail invalido.");
  }

  if (typeof customerName !== "string" || !customerName.trim()) {
    throw new Error("customerName invalido.");
  }

  if (metodoPagamento !== undefined) {
    if (typeof metodoPagamento !== "string" || !ALLOWED_PAYMENT_METHODS.has(metodoPagamento)) {
      throw new Error("metodo_pagamento invalido.");
    }
  }

  const optionalString = (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === "") return undefined;
    if (typeof value !== "string") throw new Error("Payload contem campos opcionais invalidos.");
    return value;
  };

  return {
    itemIds,
    customerEmail: normalizeEmail(customerEmail),
    customerName: customerName.trim(),
    customerTelefone: optionalString(payload.customerTelefone),
    customerMorada: optionalString(payload.customerMorada),
    nif: optionalString(payload.nif),
    notas: optionalString(payload.notas),
    metodo_pagamento: metodoPagamento ?? "transferencia",
  };
}
