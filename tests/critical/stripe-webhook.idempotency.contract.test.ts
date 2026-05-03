import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("stripe-webhook idempotency contracts", () => {
  it("completed path keeps guarded state transition", () => {
    const fnCode = readFileSync("supabase/functions/stripe-webhook/index.ts", "utf8");

    expect(fnCode).toMatch(/\.in\("estado",\s*\["pendente",\s*"cancelado"\]\)/i);
  });

  it("email sending claim stays idempotent", () => {
    const fnCode = readFileSync("supabase/functions/stripe-webhook/index.ts", "utf8");

    expect(fnCode).toMatch(/email_estado\.is\.null,email_estado\.eq\.pendente,email_estado\.eq\.retry_needed/i);
    expect(fnCode).toMatch(/stripe_webhook_email_skip_already_processing/i);
  });
});
