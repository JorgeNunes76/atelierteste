// Vercel Serverless Function — Sitemap dinâmico
// Acessível em: https://ana-alexandre.pt/sitemap.xml
// (vercel.json redireciona /sitemap.xml → /api/sitemap)

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

const SITE_URL = normalizeUrl(
  process.env.SITE_URL || process.env.VITE_PUBLIC_SITE_URL || "https://ana-alexandre.pt",
);

// Páginas estáticas do site
const STATIC_PAGES = [
  { url: "/", priority: "1.0", changefreq: "weekly" },
  { url: "/galeria", priority: "0.9", changefreq: "daily" },
  { url: "/sobre", priority: "0.7", changefreq: "monthly" },
  { url: "/mentoria", priority: "0.8", changefreq: "monthly" },
  { url: "/contactos", priority: "0.6", changefreq: "yearly" },
  { url: "/premio", priority: "0.6", changefreq: "monthly" },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inicializa Supabase com as env vars do servidor (sem VITE_ prefix em funções Vercel)
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

  let obraSlugs: Array<{ slug: string; updated_at: string | null; imagem_url: string | null }> = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("obras")
        .select("slug, updated_at, imagem_url")
        .not("slug", "is", null)
        .order("ordem", { ascending: true });

      obraSlugs = (data ?? []) as Array<{ slug: string; updated_at: string | null; imagem_url: string | null }>;
    } catch (err) {
      console.error("[sitemap] Erro ao buscar obras:", err);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const staticEntries = STATIC_PAGES.map(
    (page) => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("");

  const obraEntries = obraSlugs
    .filter((o) => o.slug)
    .map((obra) => {
      const lastmod = obra.updated_at
        ? obra.updated_at.split("T")[0]
        : today;
      return `
  <url>
    <loc>${SITE_URL}/galeria/${obra.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${obra.imagem_url ? `<image:image><image:loc>${obra.imagem_url}</image:loc></image:image>` : ""}
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${staticEntries}
${obraEntries}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
