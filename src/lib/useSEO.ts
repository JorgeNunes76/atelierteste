import { useEffect } from "react";
import { absoluteSiteUrl, PUBLIC_SITE_URL } from "./site";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const BASE_TITLE = "Ana Alexandre — Artista Plástica | Atelier em Tomar";
const BASE_DESC  = "Atelier de Ana Alexandre, artista plástica em Tomar. Obras originais, orientação artística e exposições. Pintura contemporânea portuguesa.";
const BASE_URL   = PUBLIC_SITE_URL;
const BASE_IMAGE = absoluteSiteUrl("/og-image.jpg");

function setMeta(name: string, content: string, attr = "name") {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSEO({ title, description, image, url }: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Ana Alexandre` : BASE_TITLE;
    const desc  = description ?? BASE_DESC;
    const img   = image ?? BASE_IMAGE;
    const pageUrl = url ? absoluteSiteUrl(url) : BASE_URL;

    document.title = fullTitle;

    setMeta("description", desc);
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", desc, "property");
    setMeta("og:image", img, "property");
    setMeta("og:url", pageUrl, "property");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", img);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;
  }, [title, description, image, url]);
}
