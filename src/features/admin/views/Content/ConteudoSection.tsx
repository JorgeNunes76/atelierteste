import { useState, useEffect } from "react";
import { getConfigAll, updateConfigAdmin } from "../../../../lib/db";
import { motion, AnimatePresence } from "motion/react";
import { Save, Image as ImageIcon, FileText, Globe, User, Phone, MapPin, Clock, Mail, Sparkles, Layout } from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD, SLATE } from "../../../../lib/tokens";

type Tab = "home" | "sobre" | "orientação" | "contacto";

export function ConteudoSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      setLoading(true);
      const data = await getConfigAll();
      const map: Record<string, string> = {};
      data.forEach((d) => {
        map[d.chave] = d.valor;
      });
      setConfigs(map);
    } catch (e) {
      if (import.meta.env?.DEV) console.error("Erro ao carregar configurações:", e);
      toast.error("Erro ao carregar as configurações do site.");
    } finally {
      setLoading(false);
    }
  }

  const handleUpdate = (key: string, value: string) => {
    setConfigs((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = async (chave: string, valor: string) => {
    setSaving(true);
    try {
      await updateConfigAdmin(chave, valor);
      toast.success(`"${chave}" atualizada com sucesso!`);
    } catch (e) {
      if (import.meta.env?.DEV) console.error("Erro ao salvar:", e);
      toast.error("Falha ao guardar alteração.");
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(configs).map(([k, v]) => updateConfigAdmin(k, v));
      await Promise.all(promises);
      toast.success("Todas as alterações foram guardadas.");
    } catch (e) {
      toast.error("Ocorreu um erro ao guardar algumas alterações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: SLATE }}>
        <p>A carregar configurações do website...</p>
      </div>
    );
  }

  const tabs: { id: Tab | "geral"; label: string; icon: any }[] = [
    { id: "geral", label: "Definições Gerais", icon: Globe },
    { id: "home", label: "Página Inicial", icon: Layout },
    { id: "sobre", label: "Sobre Mim", icon: User },
    { id: "orientação", label: "Orientação", icon: Sparkles },
    { id: "contacto", label: "Contactos & Rodapé", icon: Phone },
  ];

  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Gestão de Conteúdo
          </p>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a2130", margin: 0 }}> Configurações do Website</h1>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          style={{
            background: GOLD,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(201,169,110,0.3)",
            opacity: saving ? 0.7 : 1,
            transition: "all 0.2s"
          }}
        >
          <Save size={18} />
          {saving ? "A guardar..." : "Guardar Todas as Alterações"}
        </button>
      </div>

      {/* Internal Tabs */}
      <div style={{ 
        display: "flex", 
        gap: 8, 
        background: "#f0f2f5", 
        padding: 6, 
        borderRadius: 14, 
        marginBottom: 32,
        width: "fit-content"
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: isActive ? "#fff" : "transparent",
                color: isActive ? GOLD : SLATE,
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth: 1000 }}>
        {activeTab === ("geral" as any) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Section title="SEO & Presença Digital">
              <InputField 
                label="Título Base do Site" 
                value={configs.site_title || "Ana Alexandre | Artista Plástica"} 
                onChange={(v) => handleUpdate("site_title", v)} 
                onSave={(v) => saveConfig("site_title", v)}
              />
              <TextareaField 
                label="Descrição Global (Meta)" 
                value={configs.site_description || "Descubra o universo artístico de Ana Alexandre. Obras originais, pintura contemporânea e orientação artística em Tomar."} 
                onChange={(v) => handleUpdate("site_description", v)} 
                onSave={(v) => saveConfig("site_description", v)}
                rows={3}
              />
            </Section>

            <Section title="Redes Sociais">
              <InputField 
                label="Instagram (URL Completa)" 
                value={configs.social_instagram} 
                onChange={(v) => handleUpdate("social_instagram", v)} 
                onSave={(v) => saveConfig("social_instagram", v)}
              />
              <InputField 
                label="Facebook (URL Completa)" 
                value={configs.social_facebook} 
                onChange={(v) => handleUpdate("social_facebook", v)} 
                onSave={(v) => saveConfig("social_facebook", v)}
              />
            </Section>
          </motion.div>
        )}

        {activeTab === "home" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Section title="Hero (Destaque Principal)">
              <ImageField 
                label="Imagem do Hero" 
                value={configs.hero_imagem} 
                onChange={(v) => handleUpdate("hero_imagem", v)} 
                onSave={(v) => saveConfig("hero_imagem", v)}
              />
              <InputField 
                label="Título Principal" 
                value={configs.hero_titulo} 
                onChange={(v) => handleUpdate("hero_titulo", v)} 
                onSave={(v) => saveConfig("hero_titulo", v)}
              />
              <TextareaField 
                label="Subtítulo / Descrição" 
                value={configs.hero_subtitulo} 
                onChange={(v) => handleUpdate("hero_subtitulo", v)} 
                onSave={(v) => saveConfig("hero_subtitulo", v)}
              />
            </Section>

            <Section title="Secção de Vendas / Loja">
              <InputField 
                label="Título da Galeria" 
                value={configs.galeria_titulo || "Coleção de Obras"} 
                onChange={(v) => handleUpdate("galeria_titulo", v)} 
                onSave={(v) => saveConfig("galeria_titulo", v)}
              />
            </Section>
          </motion.div>
        )}

        {activeTab === "sobre" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Section title="Página Sobre Mim">
              <ImageField 
                label="Imagem de Perfil / Atelier" 
                value={configs.sobre_imagem} 
                onChange={(v) => handleUpdate("sobre_imagem", v)} 
                onSave={(v) => saveConfig("sobre_imagem", v)}
              />
              <InputField 
                label="Título da Biografia" 
                value={configs.sobre_titulo} 
                onChange={(v) => handleUpdate("sobre_titulo", v)} 
                onSave={(v) => saveConfig("sobre_titulo", v)}
              />
              <TextareaField 
                label="Texto da Biografia" 
                value={configs.sobre_texto} 
                onChange={(v) => handleUpdate("sobre_texto", v)} 
                onSave={(v) => saveConfig("sobre_texto", v)}
                rows={10}
              />
              
              <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 20, marginTop: 10 }}>
                <h4 style={{ fontSize: "0.85rem", color: "#333", marginBottom: 16 }}>Secção Secundária (Exposições)</h4>
                <ImageField 
                  label="Imagem da Galeria / Secção II" 
                  value={configs.sobre_imagem_2} 
                  onChange={(v) => handleUpdate("sobre_imagem_2", v)} 
                  onSave={(v) => saveConfig("sobre_imagem_2", v)}
                />
                <TextareaField 
                  label="Texto da Secção II" 
                  value={configs.sobre_texto_2} 
                  onChange={(v) => handleUpdate("sobre_texto_2", v)} 
                  onSave={(v) => saveConfig("sobre_texto_2", v)}
                  rows={6}
                />
              </div>
            </Section>
          </motion.div>
        )}

        {activeTab === "orientação" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Section title="Página de Orientação">
              <ImageField 
                label="Imagem de Destaque Orientação" 
                value={configs.mentoria_imagem} 
                onChange={(v) => handleUpdate("orientação_imagem", v)} 
                onSave={(v) => saveConfig("orientação_imagem", v)}
              />
              <InputField 
                label="Título da Orientação" 
                value={configs.mentoria_titulo} 
                onChange={(v) => handleUpdate("orientação_titulo", v)} 
                onSave={(v) => saveConfig("orientação_titulo", v)}
              />
              <TextareaField 
                label="Texto Descritivo" 
                value={configs.mentoria_desc} 
                onChange={(v) => handleUpdate("orientação_desc", v)} 
                onSave={(v) => saveConfig("orientação_desc", v)}
                rows={6}
              />
            </Section>
          </motion.div>
        )}

        {activeTab === "contacto" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Section title="Informações de Contacto">
              <InputField 
                label="E-mail de Contacto" 
                value={configs.contacto_email} 
                onChange={(v) => handleUpdate("contacto_email", v)} 
                onSave={(v) => saveConfig("contacto_email", v)}
                icon={Mail}
              />
              <InputField 
                label="Telefone / Telemóvel" 
                value={configs.contacto_telefone} 
                onChange={(v) => handleUpdate("contacto_telefone", v)} 
                onSave={(v) => saveConfig("contacto_telefone", v)}
                icon={Phone}
              />
              <InputField 
                label="Morada Completa" 
                value={configs.contacto_morada} 
                onChange={(v) => handleUpdate("contacto_morada", v)} 
                onSave={(v) => saveConfig("contacto_morada", v)}
                icon={MapPin}
              />
              <TextareaField 
                label="Horário de Atendimento" 
                value={configs.contacto_horario} 
                onChange={(v) => handleUpdate("contacto_horario", v)} 
                onSave={(v) => saveConfig("contacto_horario", v)}
                icon={Clock}
              />
            </Section>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes de Formulário ──────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ 
      background: "#fff", 
      borderRadius: 20, 
      border: "1px solid #eef0f3", 
      padding: 32, 
      marginBottom: 32,
      boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
    }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2130", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 18, background: GOLD, borderRadius: 2 }} />
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSave: (val: string) => void;
  icon?: any;
}

function InputField({ label, value, onChange, onSave, icon: Icon }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          {Icon && <Icon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: GOLD }} />}
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: `12px 16px 12px ${Icon ? "40px" : "16px"}`,
              borderRadius: 12,
              border: "1px solid #dee2e6",
              fontSize: "0.9rem",
              outline: "none",
              color: "#333",
              background: "#fcfcfc"
            }}
          />
        </div>
        <button 
          onClick={() => onSave(value)}
          style={{ background: "#f0f2f5", border: "none", padding: "0 16px", borderRadius: 12, cursor: "pointer", color: GOLD, fontSize: "0.8rem", fontWeight: 600 }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}

function TextareaField({ label, value, onChange, onSave, rows = 4, icon: Icon }: FieldProps & { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative" }}>
           {Icon && <Icon size={16} style={{ position: "absolute", left: 14, top: 20, color: GOLD }} />}
          <textarea
            rows={rows}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "100%",
              padding: `14px 16px 14px ${Icon ? "40px" : "16px"}`,
              borderRadius: 12,
              border: "1px solid #dee2e6",
              fontSize: "0.9rem",
              outline: "none",
              color: "#333",
              resize: "vertical",
              lineHeight: 1.6,
              background: "#fcfcfc"
            }}
          />
        </div>
        <button 
          onClick={() => onSave(value)}
          style={{ alignSelf: "flex-end", background: "#f0f2f5", border: "none", padding: "10px 20px", borderRadius: 12, cursor: "pointer", color: GOLD, fontSize: "0.8rem", fontWeight: 600 }}
        >
          Guardar Texto
        </button>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange, onSave }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: SLATE, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "start" }}>
        {/* Preview */}
        <div style={{ 
          width: 180, 
          height: 120, 
          borderRadius: 12, 
          overflow: "hidden", 
          border: "1px solid #eef0f3",
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {value ? (
            <img src={value} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ textAlign: "center", color: "#ccc" }}>
              <ImageIcon size={32} style={{ marginBottom: 4, display: "block", margin: "0 auto" }} />
              <span style={{ fontSize: "0.6rem" }}>Sem imagem</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Globe size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: GOLD }} />
              <input
                type="text"
                placeholder="URL da imagem..."
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px 12px 40px",
                  borderRadius: 12,
                  border: "1px solid #dee2e6",
                  fontSize: "0.85rem",
                  outline: "none",
                  background: "#fcfcfc"
                }}
              />
            </div>
            <button 
              onClick={() => onSave(value)}
              style={{ background: GOLD, border: "none", padding: "0 20px", borderRadius: 12, cursor: "pointer", color: "#fff", fontSize: "0.8rem", fontWeight: 600 }}
            >
              Atualizar
            </button>
          </div>
          <p style={{ fontSize: "0.7rem", color: SLATE, margin: 0 }}>
            Coloque o link direto da imagem (Supabase Storage, Unsplash, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
