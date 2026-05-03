import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function absoluteSiteUrl(siteUrl: string, path = "/"): string {
  if (!path || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDescription(obra: {
  descricao: string | null;
  tecnica: string | null;
  dimensoes: string | null;
  ano: number | null;
}): string {
  if (obra.descricao?.trim()) {
    return obra.descricao.trim().replace(/\s+/g, " ").slice(0, 220);
  }

  const details = [obra.tecnica, obra.dimensoes, obra.ano ? String(obra.ano) : null]
    .filter(Boolean)
    .join(" · ");

  return details
    ? `${details} — obra original de Ana Alexandre.`
    : "Obra original de Ana Alexandre.";
}

function buildHtml(params: {
  siteUrl: string;
  canonicalUrl: string;
  title: string;
  description: string;
  imageUrl: string;
}) {
  const safeTitle = escapeHtml(params.title);
  const safeDescription = escapeHtml(params.description);
  const safeCanonicalUrl = escapeHtml(params.canonicalUrl);
  const safeImageUrl = escapeHtml(params.imageUrl);
  const safeSiteUrl = escapeHtml(params.siteUrl);

  return `<!DOCTYPE html>
<html lang="pt-PT">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeCanonicalUrl}" />

    <meta property="og:site_name" content="Ana Alexandre" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${safeCanonicalUrl}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${safeCanonicalUrl}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />

    <meta http-equiv="refresh" content="0;url=${safeCanonicalUrl}" />
    <script>window.location.replace(${JSON.stringify(params.canonicalUrl)});</script>
  </head>
  <body>
    <p>A abrir <a href="${safeCanonicalUrl}">${safeTitle}</a>.</p>
    <p><a href="${safeSiteUrl}">Ana Alexandre</a></p>
  </body>
</html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";
  const siteUrl = normalizeUrl(
    process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || "https://ana-alexandre.pt",
  );
  const fallbackImage = absoluteSiteUrl(siteUrl, "/og-image.png");

  if (!slug) {
    res.status(400).json({ error: "slug is required" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: "Supabase env vars missing" });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: obra, error } = await supabase
      .from("obras")
      .select("slug, titulo, descricao, tecnica, dimensoes, ano, imagem_url")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("[obra-meta] lookup:", error.message);
      throw error;
    }

    if (!obra) {
      res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(
        buildHtml({
          siteUrl,
          canonicalUrl: absoluteSiteUrl(siteUrl, `/galeria/${slug}`),
          title: "Obra não encontrada | Ana Alexandre",
          description: "A obra pedida não está disponível.",
          imageUrl: fallbackImage,
        }),
      );
      return;
    }

    const canonicalUrl = absoluteSiteUrl(siteUrl, `/galeria/${obra.slug}`);
    const title = `${obra.titulo} | Ana Alexandre`;
    const description = buildDescription(obra);
    const imageUrl = obra.imagem_url?.startsWith("http")
      ? obra.imagem_url
      : fallbackImage;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.status(200).send(
      buildHtml({
        siteUrl,
        canonicalUrl,
        title,
        description,
        imageUrl,
      }),
    );
  } catch (err) {
    console.error("[obra-meta] unexpected:", err);
    res.status(500).setHeader("Content-Type", "text/html; charset=utf-8").send(
      buildHtml({
        siteUrl,
        canonicalUrl: absoluteSiteUrl(siteUrl, `/galeria/${slug}`),
        title: "Ana Alexandre | Atelier de Arte",
        description: "Galeria de obras originais de Ana Alexandre.",
        imageUrl: fallbackImage,
      }),
    );
  }
}
