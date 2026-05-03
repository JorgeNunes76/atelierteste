const DEFAULT_SITE_URL = "https://ana-alexandre.pt";
const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
];

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function normalizeOrigin(origin: string): string | null {
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

function parseExtraOrigins(raw: string | undefined): string[] {
  if (!raw) return [];

  return raw
    .split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter((value): value is string => Boolean(value));
}

export function getCanonicalSiteUrl(): string {
  const envUrl = Deno.env.get("SITE_URL") ?? Deno.env.get("PUBLIC_SITE_URL");
  return normalizeUrl(envUrl || DEFAULT_SITE_URL);
}

export function getAllowedOrigins(): string[] {
  const canonicalOrigin = new URL(getCanonicalSiteUrl()).origin;
  const extraOrigins = parseExtraOrigins(Deno.env.get("ALLOWED_ORIGINS"));
  return [...new Set([canonicalOrigin, ...DEFAULT_LOCAL_ORIGINS, ...extraOrigins])];
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return false;
  return getAllowedOrigins().includes(normalizedOrigin);
}

export function getCorsHeaders(req: Request) {
  const requestOrigin = normalizeOrigin(req.headers.get("origin") ?? "");
  const fallbackOrigin = new URL(getCanonicalSiteUrl()).origin;
  const allowedOrigin = requestOrigin && isAllowedOrigin(requestOrigin)
    ? requestOrigin
    : fallbackOrigin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

export function createInvalidOriginResponse(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  return new Response(
    JSON.stringify({ error: "Origin não permitida." }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

export function resolveSiteUrlForRequest(req: Request): string {
  const canonicalSiteUrl = getCanonicalSiteUrl();
  const requestOrigin = normalizeOrigin(req.headers.get("origin") ?? "");

  if (!requestOrigin || !isAllowedOrigin(requestOrigin)) {
    return canonicalSiteUrl;
  }

  if (requestOrigin.startsWith("http://localhost:")) {
    return requestOrigin;
  }

  return canonicalSiteUrl;
}
