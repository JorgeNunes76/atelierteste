import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("atomic reservation contract", () => {
  it("migration keeps atomic RPC with row locking", () => {
    const sql = readFileSync("supabase/migrations/20260413_atomic_reservation.sql", "utf8");

    expect(sql).toMatch(/reserve_obras_and_create_venda/i);
    expect(sql).toMatch(/FOR UPDATE/i);
    expect(sql).toMatch(/estado\s*=\s*'reservado'/i);
    expect(sql).toMatch(/reserved_until/i);
  });

  it("create-checkout-session uses the atomic RPC", () => {
    const fnCode = readFileSync("supabase/functions/create-checkout-session/index.ts", "utf8");

    expect(fnCode).toMatch(/\.rpc\(\s*"reserve_obras_and_create_venda"/i);
  });
});
