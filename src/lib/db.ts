/// <reference types="vite/client" />
import { supabase } from "./supabase";
import type { Database } from "./database.types";
import { captureClientError } from "./observability";

type Obra = Database["public"]["Tables"]["obras"]["Row"];
type ObraInsert = Database["public"]["Tables"]["obras"]["Insert"];
type ObraUpdate = Database["public"]["Tables"]["obras"]["Update"];
type ContactoInsert = Database["public"]["Tables"]["contactos"]["Insert"];
type Contacto = Database["public"]["Tables"]["contactos"]["Row"];
type NewsletterRow = Database["public"]["Tables"]["newsletter"]["Row"];
type ConfigRow = Database["public"]["Tables"]["config_site"]["Row"];
type VendaInsert = Database["public"]["Tables"]["vendas"]["Insert"];
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function invokePublicFunction<TResponse>(
  functionName: string,
  payload: unknown,
  signal?: AbortSignal,
): Promise<TResponse> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    });

    let body: Record<string, unknown> | null = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const errorMessage = typeof body?.error === "string" ? body.error : "Pedido inv\u00e1lido.";
      captureClientError(new Error(errorMessage), {
        source: "frontend.edge_function_request_failed",
        tags: { function_name: functionName, status_code: res.status },
      });
      throw new Error(errorMessage);
    }

    return (body ?? {}) as TResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    captureClientError(error, {
      source: "frontend.edge_function_request_exception",
      tags: { function_name: functionName },
    });
    throw error;
  }
}

// ── Obras ─────────────────────────────────────────────────────────────────────

export async function getObras(): Promise<Obra[]> {
  try {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .order("ordem", { ascending: true });
    if (error) {
      if (import.meta.env?.DEV) console.warn("Supabase getObras error:", error.message);
      return [];
    }
    return (data as Obra[]) ?? [];
  } catch (e) {
    if (import.meta.env?.DEV) console.warn("Supabase getObras connection error:", e);
    return [];
  }
}

export async function getObraById(id: string): Promise<Obra | null> {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Obra;
}

export async function getObraBySlug(slug: string): Promise<Obra | null> {
  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as Obra;
}

export async function getObrasDestaque(): Promise<Obra[]> {
  try {
    const { data, error } = await supabase
      .from("obras")
      .select("*")
      .eq("destaque", true)
      .order("ordem", { ascending: true })
      .limit(6);
    if (error) {
      if (import.meta.env?.DEV) console.warn("Supabase getObrasDestaque error:", error.message);
      return [];
    }
    return (data as Obra[]) ?? [];
  } catch (e) {
    if (import.meta.env?.DEV) console.warn("Supabase getObrasDestaque connection error:", e);
    return [];
  }
}

// ── Contactos ─────────────────────────────────────────────────────────────────

export async function enviarContacto(
  contacto: ContactoInsert & { website?: string; submitted_at?: number },
  options?: { signal?: AbortSignal },
): Promise<void> {
  await invokePublicFunction("submit-contact", contacto, options?.signal);
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export async function subscribeNewsletter(
  email: string,
  options?: { signal?: AbortSignal },
): Promise<"ok" | "already_subscribed"> {
  const response = await invokePublicFunction<{ status?: "ok" | "already_subscribed" }>(
    "subscribe-newsletter",
    { email },
    options?.signal,
  );

  return response.status === "already_subscribed" ? "already_subscribed" : "ok";
}

// ── Config ────────────────────────────────────────────────────────────────────

export async function getConfig(chave: string): Promise<string | null> {
  const { data } = await supabase
    .from("config_site")
    .select("valor")
    .eq("chave", chave)
    .single();
  const row = data as { valor: string } | null;
  return row?.valor ?? null;
}

// ── Admin: Obras CRUD ──────────────────────────────────────────────────────────

export async function createObra(obra: ObraInsert): Promise<Obra> {
  const { data, error } = await supabase.from("obras")
    .insert(obra)
    .select()
    .single();
  if (error) {
      if (import.meta.env?.DEV) console.error("[createObra] Erro ao inserir obra:", error);
      throw error;
  }
  return data as Obra;
}

export async function updateObra(id: string, updates: ObraUpdate): Promise<void> {
  const { error } = await supabase.from("obras").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteObra(id: string): Promise<void> {
  const { error } = await supabase.from("obras").delete().eq("id", id);
  if (error) throw error;
}

// ── Admin: Contactos ───────────────────────────────────────────────────────────

export async function getContactosAdmin(): Promise<Contacto[]> {
  const { data, error } = await supabase
    .from("contactos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Contacto[]) ?? [];
}

export async function marcarContactoLido(id: string): Promise<void> {
  const { error } = await supabase.from("contactos").update({ lido: true }).eq("id", id);
  if (error) throw error;
}

export async function deleteContacto(id: string): Promise<void> {
  const { error } = await supabase.from("contactos").delete().eq("id", id);
  if (error) throw error;
}

// ── Admin: Newsletter ──────────────────────────────────────────────────────────

export async function getNewsletterAdmin(): Promise<NewsletterRow[]> {
  const { data, error } = await supabase
    .from("newsletter")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as NewsletterRow[]) ?? [];
}

export async function toggleNewsletterStatus(id: string, ativo: boolean): Promise<void> {
  const { error } = await supabase.from("newsletter").update({ ativo }).eq("id", id);
  if (error) throw error;
}

export async function createVenda(venda: VendaInsert): Promise<string | null> {
  const { data, error } = await supabase.from("vendas")
    .insert(venda)
    .select()
    .single();

  if (error) {
    if (import.meta.env?.DEV) console.error("[createVenda] Erro detalhado:", error);
    throw error;
  }
  return data?.id || null;
}

export async function updateObraStatus(id: string, estado: "disponivel" | "reservado" | "vendido"): Promise<void> {
  const { error } = await supabase.from("obras").update({ estado }).eq("id", id);
  if (error) throw error;
}

// ── Admin: Config ─────────────────────────────────────────────────────────────

export async function getConfigAll(): Promise<ConfigRow[]> {
  const { data, error } = await supabase.from("config_site").select("*");
  if (error) throw error;
  return (data as ConfigRow[]) ?? [];
}

export async function updateConfigAdmin(chave: string, valor: string): Promise<void> {
  const { error } = await supabase.from("config_site")
    .upsert({ chave, valor }, { onConflict: "chave" });
  if (error) throw error;
}

// ── Admin: Vendas ─────────────────────────────────────────────────────────────

type VendaRow = Database["public"]["Tables"]["vendas"]["Row"];

export async function getVendasAdmin(): Promise<VendaRow[]> {
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VendaRow[]) ?? [];
}

export async function updateVendaEstado(
  id: string,
  estado: "pendente" | "pago" | "enviado" | "cancelado"
): Promise<void> {
  const { error } = await supabase.from("vendas").update({ estado }).eq("id", id);
  if (error) throw error;
}

// ── Admin: Stats ───────────────────────────────────────────────────────────────

export async function getStatsAdmin(): Promise<{
  totalObras: number;
  mensagensNaoLidas: number;
  totalNewsletter: number;
  vendasTotal: number;
}> {
  const [obras, mensagens, newsletter, vendas] = await Promise.all([
    supabase.from("obras").select("id", { count: "exact", head: true }),
    supabase.from("contactos").select("id", { count: "exact", head: true }).eq("lido", false),
    supabase.from("newsletter").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("vendas").select("total").neq("estado", "cancelado"),
  ]);

  const totalVendas = (vendas.data as { total: number }[] ?? []).reduce((acc, curr) => acc + (curr.total || 0), 0);

  return {
    totalObras: obras.count ?? 0,
    mensagensNaoLidas: mensagens.count ?? 0,
    totalNewsletter: newsletter.count ?? 0,
    vendasTotal: totalVendas,
  };
}

// ── Storage: Upload de Imagens ─────────────────────────────────────────────────

export async function uploadObraImage(file: File): Promise<string> {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const maxBytes = 8 * 1024 * 1024;

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato de imagem inválido. Usa JPG, PNG, WEBP ou AVIF.");
  }

  if (file.size > maxBytes) {
    throw new Error("Imagem demasiado grande. Máximo permitido: 8MB.");
  }

  const extByMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const fileExt = extByMime[file.type] ?? "jpg";
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${fileExt}`;
  const filePath = `artworks/${year}/${month}/${fileName}`;

  const { error } = await supabase.storage
    .from("obras")
    .upload(filePath, file, { cacheControl: "31536000", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage
    .from("obras")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteObraImage(imageUrl: string): Promise<void> {
  // Extrai o nome do ficheiro da URL pública
  const urlParts = imageUrl.split("/storage/v1/object/public/obras/");
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from("obras")
    .remove([filePath]);

  if (error) {
    if (import.meta.env?.DEV) console.error("Erro ao eliminar imagem:", error);
  }
}
export async function uploadSiteImage(file: File, chave: string): Promise<string> {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
  const maxBytes = 8 * 1024 * 1024;

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato de imagem inválido. Usa JPG, PNG, WEBP ou AVIF.");
  }

  if (file.size > maxBytes) {
    throw new Error("Imagem demasiado grande. Máximo permitido: 8MB.");
  }

  const extByMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const fileExt = extByMime[file.type] ?? "jpg";
  const fileName = `${chave}-${Date.now()}.${fileExt}`;

  // Tentamos enviar para o bucket 'obras' já que já existe, mas numa pasta 'site/'
  const { error } = await supabase.storage
    .from("obras") // Usando o bucket existente por segurança
    .upload(`site/${fileName}`, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("obras")
    .getPublicUrl(`site/${fileName}`);

  return data.publicUrl;
}
