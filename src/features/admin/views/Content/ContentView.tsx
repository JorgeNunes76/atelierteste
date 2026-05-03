import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Upload } from "lucide-react";
import { getConfigAll, updateConfigAdmin, uploadSiteImage } from "../../../../lib/db";
import {
  SITE_CONTENT_FIELDS,
  SITE_CONTENT_DEFAULTS,
  SiteContent,
  SiteContentKey,
  buildSiteContentFromConfigs,
  sanitizeSiteContentValue,
} from "../../../../lib/siteContent";
import { toast } from "../../../../lib/toast";
import { GOLD } from "../../../../lib/tokens";

type SectionId = "geral" | "homepage" | "sobre" | "contacto" | "pagamentos";

const SECTION_LABELS: Record<SectionId, string> = {
  geral: "Geral",
  homepage: "Homepage",
  sobre: "Sobre",
  contacto: "Contacto",
  pagamentos: "Pagamentos",
};

export function ConteudosSection() {
  const [content, setContent] = useState<SiteContent>({ ...SITE_CONTENT_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("homepage");
  const [savingKey, setSavingKey] = useState<SiteContentKey | null>(null);
  const [uploadingKey, setUploadingKey] = useState<SiteContentKey | null>(null);

  useEffect(() => {
    void loadContent();
  }, []);

  const fieldsBySection = useMemo(() => {
    return {
      geral: SITE_CONTENT_FIELDS.filter((field) => field.section === "geral"),
      homepage: SITE_CONTENT_FIELDS.filter((field) => field.section === "homepage"),
      sobre: SITE_CONTENT_FIELDS.filter((field) => field.section === "sobre"),
      contacto: SITE_CONTENT_FIELDS.filter((field) => field.section === "contacto"),
      pagamentos: SITE_CONTENT_FIELDS.filter((field) => field.section === "pagamentos"),
    } as const;
  }, []);

  async function loadContent() {
    setLoading(true);
    try {
      const rows = await getConfigAll();
      setContent(buildSiteContentFromConfigs(rows));
    } catch (error) {
      toast.error("Erro ao carregar conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  async function saveField(key: SiteContentKey) {
    const safeValue = sanitizeSiteContentValue(key, content[key]);
    setSavingKey(key);
    try {
      await updateConfigAdmin(key, safeValue);
      setContent((prev) => ({ ...prev, [key]: safeValue }));
      toast.success("Conteúdo guardado com sucesso.");
    } catch (error) {
      toast.error("Erro ao guardar este campo.");
    } finally {
      setSavingKey(null);
    }
  }

  async function saveSection(section: SectionId) {
    const fields = fieldsBySection[section];
    const keys = fields.map((field) => field.key);
    try {
      await Promise.all(
        keys.map(async (key) => {
          const safeValue = sanitizeSiteContentValue(key, content[key]);
          await updateConfigAdmin(key, safeValue);
        }),
      );
      setContent((prev) => {
        const next = { ...prev };
        for (const key of keys) {
          next[key] = sanitizeSiteContentValue(key, next[key]);
        }
        return next;
      });
      toast.success("Secção guardada com sucesso.");
    } catch {
      toast.error("Erro ao guardar esta secção.");
    }
  }

  function updateValue(key: SiteContentKey, value: string) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(key: SiteContentKey, file: File | null) {
    if (!file) return;

    setUploadingKey(key);
    try {
      const publicUrl = await uploadSiteImage(file, key);
      const safeUrl = sanitizeSiteContentValue(key, publicUrl);
      await updateConfigAdmin(key, safeUrl);
      setContent((prev) => ({ ...prev, [key]: safeUrl }));
      toast.success("Imagem atualizada com sucesso.");
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || "Erro ao carregar imagem.");
    } finally {
      setUploadingKey(null);
    }
  }

  if (loading) {
    return <div className="p-16 text-center text-slate-500">A carregar conteúdo...</div>;
  }

  const fields = fieldsBySection[activeSection];

  return (
    <div className="p-8 pb-28 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Admin · Conteúdo</p>
          <h2 className="text-2xl font-bold text-slate-900">Edição de Conteúdo</h2>
          <p className="text-sm text-slate-500 mt-2">A estrutura visual do site mantém-se fixa. Aqui editas apenas texto e imagem controlados.</p>
        </div>

        <button
          onClick={() => void saveSection(activeSection)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ background: GOLD }}
        >
          <Save size={14} />
          Guardar Secção
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(Object.keys(SECTION_LABELS) as SectionId[]).map((section) => {
          const active = section === activeSection;
          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: active ? GOLD : "rgba(15,23,42,0.12)",
                color: active ? GOLD : "#475569",
                background: active ? "rgba(201,169,110,0.08)" : "#fff",
              }}
            >
              {SECTION_LABELS[section]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5">
        {fields.map((field) => {
          const value = content[field.key] ?? "";
          const saving = savingKey === field.key;
          const uploading = uploadingKey === field.key;

          return (
            <div key={field.key} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{field.key}</p>
                  <p className="text-sm font-semibold text-slate-700">{field.label}</p>
                </div>
                <button
                  onClick={() => void saveField(field.key)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: saving ? "#f1f5f9" : "rgba(201,169,110,0.12)",
                    color: saving ? "#94a3b8" : GOLD,
                  }}
                >
                  {saving ? "A guardar..." : "Guardar"}
                </button>
              </div>

              {field.kind === "textarea" ? (
                <textarea
                  value={value}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  rows={6}
                  maxLength={field.maxLength}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#C9A96E40]"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(event) => updateValue(field.key, event.target.value)}
                  maxLength={field.maxLength}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#C9A96E40]"
                />
              )}

              {(field.kind === "image" || field.kind === "url") && (
                <div className="space-y-3">
                  {field.kind === "image" && value && (
                    <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 aspect-video">
                      <img src={sanitizeSiteContentValue(field.key, value)} alt={field.label} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {field.kind === "image" && (
                    <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50">
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading ? "A carregar..." : "Upload de imagem"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) => {
                          void handleImageUpload(field.key, event.target.files?.[0] ?? null);
                          event.currentTarget.value = "";
                        }}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-400">Máximo: {field.maxLength} caracteres.</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
