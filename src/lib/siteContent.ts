import type { Database } from "./database.types";

type ConfigRow = Database["public"]["Tables"]["config_site"]["Row"];

type FieldKind = "text" | "textarea" | "image" | "email" | "tel" | "url";

type ContentField = {
  key: SiteContentKey;
  section: "geral" | "homepage" | "sobre" | "contacto" | "pagamentos";
  label: string;
  kind: FieldKind;
  maxLength: number;
};

export const SITE_CONTENT_DEFAULTS = {
  site_title: "Ana Alexandre | Artista Plástica",
  site_description: "Obras originais e pintura contemporanêa de Ana Alexandre.",
  social_instagram: "https://www.instagram.com/margaridajalexandre",

  hero_titulo: "O Silêncio da Cor",
  hero_subtitulo: "Investigação Plástica e Pintura Contemporanêa.",
  hero_imagem: "/hero-principal.jpg",
  bio_texto: "Artista plástica focada na exploração da luz e da cor.",
  process_imagem: "/paint-detail.jpg",

  sobre_titulo: "Ana Alexandre (Tomar, 1976)",
  sobre_texto:
    "Artista Plástica, Investigadora e Docente na área das Belas Artes.\n\nDesde cedo revelou interesse pelo desenho e pela pintura, encontrando nessas práticas um espaço de construção, reflexão inicial com a imagem. \n\n Desenvolveu um percurso artístico centrado na pintura enquanto campo de investigação estética e reflexão critica. \n\nA sua obra afirma-se através de uma linguagem marcada pela abstração cromática, onde a cor assume um papel central como elemento expressivo, estrutural e sensível. \n\nNas suas composições, gesto, matéria e equilíbrio formal articulam-se numa pesquisa continua entre intensidade e subtileza, ordem e espontaneidade. \n\nAo longo do seu percurso, tem vindo a consolidar uma prática coerente e singular, na qual cada trabalho surge como espaço de experimentação e renovação. Através da pintura, propõe experiências visuais que convidam à contemplação e a uma leitura  aberta, onde a superfície pictórica se transforma em lugar de pensamento e possibilidade."
  ,
  sobre_imagem: "/ana-alexandre-retrato-v2.jpg",
  sobre_texto_2:
    "Doutorou-se em Pintura - Modos de Conhecimento na Prática Artística Contemporânea pela Faculdade de Belas Artes da Universidade de Vigo (2015), com a tese  “A Pintura Abstracta Portuguesa No Seculo XXI” de natureza teórica centrada nas problemáticas da pintura contemporânea, aprofundando os seus fundamentos conceptuais, enquadramentos críticos e dimensões epistemológicas. \n\n Concluiu o Mestrado em Pintura na Faculdade de Belas Artes da Universidade do Porto (2004-2006) e a Licenciatura em Pintura na Escola Universitária das Artes de Coimbra – (ARCA - ETAC)(1995 - 2000).\n\nA sua atividade articula prática artística e investigação assumindo a pintura como território de produção de conhecimento. \n\nParticipa regularmente em exposições nacionais e internacionais, integrando mostras individuais e coletivas que evidenciam a consistência e continuidade do seu percurso. No âmbito da docência, lecionou no Instituto Politécnico de Tomar e desenvolve atualmente atividade no ensino superior nas áreas das artes visuais. No ensino, tal como na prática artística, privilegia o rigor, a analise e a experimentação, entendendo o processo pedagógico como um espaço de formação crítica e de desenvolvimento sensível. \n\n No seu percurso, arte, pensamento e docência convergem numa mesma matriz: a pintura como estrutura, linguagem e reflexão.",
  sobre_imagem_2: "/ana-alexandre-sobre-2-v2.jpg",

  contacto_titulo: "Vamos conversar",
  contacto_subtitulo:
    "Seja para adquirir uma obra, explorar formação artística ou propor colaboração.",
  contacto_email: "atelier.anaalexandre@gmail.com",
  contacto_telefone: "+351 967 060 682",
  contacto_morada: "Rua de Coimbra, 2300-471 Tomar, Portugal",
  contacto_horario:
    "Segunda a Sexta: 10:00-13:00 e 14:00-19:00\nSábado: 10:00-13:00 (por marcação)\nDomingo: Encerrado",

  bank_iban: "",
  bank_titular: "Ana Alexandre",
  bank_mbway: "",
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;
export type SiteContent = Record<SiteContentKey, string>;

export const SITE_CONTENT_FIELDS: ContentField[] = [
  { key: "site_title", section: "geral", label: "Titulo base do site", kind: "text", maxLength: 90 },
  { key: "site_description", section: "geral", label: "Descricao global", kind: "textarea", maxLength: 260 },
  { key: "social_instagram", section: "geral", label: "Instagram (URL)", kind: "url", maxLength: 220 },

  { key: "hero_titulo", section: "homepage", label: "Hero titulo", kind: "text", maxLength: 120 },
  { key: "hero_subtitulo", section: "homepage", label: "Hero subtitulo", kind: "textarea", maxLength: 320 },
  { key: "hero_imagem", section: "homepage", label: "Hero imagem", kind: "image", maxLength: 500 },
  { key: "bio_texto", section: "homepage", label: "Texto bio (home)", kind: "textarea", maxLength: 420 },
  { key: "process_imagem", section: "homepage", label: "Imagem processo", kind: "image", maxLength: 500 },

  { key: "sobre_titulo", section: "sobre", label: "Titulo principal", kind: "text", maxLength: 120 },
  { key: "sobre_texto", section: "sobre", label: "Texto principal", kind: "textarea", maxLength: 2600 },
  { key: "sobre_imagem", section: "sobre", label: "Imagem principal", kind: "image", maxLength: 500 },
  { key: "sobre_texto_2", section: "sobre", label: "Texto secundario", kind: "textarea", maxLength: 2200 },
  { key: "sobre_imagem_2", section: "sobre", label: "Imagem secundaria", kind: "image", maxLength: 500 },

  { key: "contacto_titulo", section: "contacto", label: "Titulo de contacto", kind: "text", maxLength: 120 },
  { key: "contacto_subtitulo", section: "contacto", label: "Subtitulo de contacto", kind: "textarea", maxLength: 320 },
  { key: "contacto_email", section: "contacto", label: "Email", kind: "email", maxLength: 190 },
  { key: "contacto_telefone", section: "contacto", label: "Telefone", kind: "tel", maxLength: 40 },
  { key: "contacto_morada", section: "contacto", label: "Morada", kind: "text", maxLength: 220 },
  { key: "contacto_horario", section: "contacto", label: "Horario", kind: "textarea", maxLength: 420 },

  { key: "bank_iban", section: "pagamentos", label: "IBAN", kind: "text", maxLength: 50 },
  { key: "bank_titular", section: "pagamentos", label: "Titular da conta", kind: "text", maxLength: 120 },
  { key: "bank_mbway", section: "pagamentos", label: "MBWay", kind: "tel", maxLength: 40 },
];

const FIELD_BY_KEY = new Map<SiteContentKey, ContentField>(
  SITE_CONTENT_FIELDS.map((field) => [field.key, field]),
);

function removeControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function clamp(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeText(value: string): string {
  return removeControlChars(value).replace(/\s+/g, " ").trim();
}

function normalizeTextarea(value: string): string {
  return removeControlChars(value).replace(/\r\n/g, "\n").trim();
}

function sanitizeRelativeOrAbsoluteUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeEmail(value: string): string | null {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}

function sanitizePhone(value: string): string | null {
  const normalized = value.trim().replace(/[^\d+()\-\s]/g, "");
  if (!normalized) return null;
  if (normalized.length < 6) return null;
  return normalized;
}

export function sanitizeSiteContentValue(key: SiteContentKey, rawValue: string): string {
  const field = FIELD_BY_KEY.get(key);
  if (!field) return SITE_CONTENT_DEFAULTS[key];

  const fallback = SITE_CONTENT_DEFAULTS[key];

  if (field.kind === "textarea") {
    const safe = clamp(normalizeTextarea(rawValue), field.maxLength);
    return safe || fallback;
  }

  if (field.kind === "image" || field.kind === "url") {
    const safeUrl = sanitizeRelativeOrAbsoluteUrl(rawValue);
    return safeUrl ? clamp(safeUrl, field.maxLength) : fallback;
  }

  if (field.kind === "email") {
    const safeEmail = sanitizeEmail(rawValue);
    return safeEmail ? clamp(safeEmail, field.maxLength) : fallback;
  }

  if (field.kind === "tel") {
    const safePhone = sanitizePhone(rawValue);
    return safePhone ? clamp(safePhone, field.maxLength) : fallback;
  }

  const safe = clamp(normalizeText(rawValue), field.maxLength);
  return safe || fallback;
}

export function buildSiteContentFromConfigs(configs: ConfigRow[]): SiteContent {
  const merged: SiteContent = { ...SITE_CONTENT_DEFAULTS };

  for (const row of configs) {
    if (!(row.chave in SITE_CONTENT_DEFAULTS)) continue;
    const key = row.chave as SiteContentKey;
    merged[key] = sanitizeSiteContentValue(key, row.valor ?? "");
  }

  return merged;
}

export function splitAddress(address: string): { line1: string; line2: string } {
  const normalized = sanitizeSiteContentValue("contacto_morada", address);
  const parts = normalized.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return { line1: normalized, line2: "" };
  }
  return {
    line1: parts[0],
    line2: parts.slice(1).join(", "),
  };
}

export function getTelephoneHref(rawPhone: string): string {
  const safePhone = sanitizeSiteContentValue("contacto_telefone", rawPhone);
  const normalized = safePhone.replace(/[^\d+]/g, "");
  return `tel:${normalized}`;
}

export function getMailToHref(rawEmail: string): string {
  const safeEmail = sanitizeSiteContentValue("contacto_email", rawEmail);
  return `mailto:${safeEmail}`;
}

