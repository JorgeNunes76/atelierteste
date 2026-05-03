import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RateLimitOptions {
  formKey: string;
  fingerprint: string;
  windowSeconds: number;
  maxAttempts: number;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function consumeRateLimit(
  supabase: SupabaseClient,
  options: RateLimitOptions,
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number }> {
  const windowStart = new Date(Date.now() - options.windowSeconds * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("public_form_submissions")
    .select("id", { count: "exact", head: true })
    .eq("form_key", options.formKey)
    .eq("fingerprint", options.fingerprint)
    .gte("created_at", windowStart);

  if (countError) throw countError;

  if ((count ?? 0) >= options.maxAttempts) {
    return { allowed: false, retryAfterSeconds: options.windowSeconds };
  }

  const { error: insertError } = await supabase
    .from("public_form_submissions")
    .insert({
      form_key: options.formKey,
      fingerprint: options.fingerprint,
    });

  if (insertError) throw insertError;

  return { allowed: true };
}
