const DEFAULT_PUBLIC_SITE_URL = "https://ana-alexandre.pt";

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export const PUBLIC_SITE_URL = normalizeUrl(
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)
    || (typeof window !== "undefined" ? window.location.origin : DEFAULT_PUBLIC_SITE_URL),
);

export function absoluteSiteUrl(path = "/"): string {
  if (!path || path === "/") return PUBLIC_SITE_URL;
  return `${PUBLIC_SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
