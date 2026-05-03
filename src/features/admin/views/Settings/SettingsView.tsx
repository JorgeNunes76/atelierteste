import { useState } from "react";
import { motion } from "motion/react";
import { 
  Settings as SettingsIcon, Save, Globe, Shield, 
  Bell, Mail, Phone, Lock, Eye, Trash2, Sliders,
  CheckCircle2, AlertCircle
} from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD, SLATE, CHARCOAL } from "../../../../lib/tokens";

export function SettingsSection() {
  const [activeTab, setActiveTab] = useState<"geral" | "seguranca" | "notificacoes">("geral");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteName: "Atelier Ana Alexandre",
    contactEmail: "ana.alexandre@atelier.com",
    contactPhone: "+351 912 345 678",
    googleAnalytics: "UA-12345678-X",
    maintenanceMode: false
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Configurações guardadas com sucesso!");
    }, 1200);
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1000px" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Sistema
        </p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: CHARCOAL, margin: 0 }}>Definições</h1>
      </header>

      <div style={{ display: "flex", gap: 32 }}>
        {/* Left Nav */}
        <aside style={{ width: 220, display: "flex", flexDirection: "column", gap: 6 }}>
          <TabButton 
            active={activeTab === "geral"} 
            onClick={() => setActiveTab("geral")} 
            label="Geral" 
            icon={Sliders} 
          />
          <TabButton 
            active={activeTab === "seguranca"} 
            onClick={() => setActiveTab("seguranca")} 
            label="Segurança" 
            icon={Shield} 
          />
          <TabButton 
            active={activeTab === "notificacoes"} 
            onClick={() => setActiveTab("notificacoes")} 
            label="Notificações" 
            icon={Bell} 
          />
        </aside>

        {/* Right Content */}
        <main style={{ flex: 1 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            {activeTab === "geral" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <SectionHeader 
                  title="Informação do Website" 
                  desc="Configure os dados base que aparecem no rodapé e metatags." 
                />
                
                <div style={{ display: "grid", gap: 20 }}>
                  <Input 
                    label="Nome do Site" 
                    value={formData.siteName} 
                    onChange={v => setFormData({...formData, siteName: v})} 
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Input 
                      label="E-mail de Contacto" 
                      value={formData.contactEmail} 
                      onChange={v => setFormData({...formData, contactEmail: v})} 
                    />
                    <Input 
                      label="Telefone Público" 
                      value={formData.contactPhone} 
                      onChange={v => setFormData({...formData, contactPhone: v})} 
                    />
                  </div>
                  <Input 
                    label="ID Google Analytics" 
                    value={formData.googleAnalytics} 
                    placeholder="G-XXXXXX..."
                    onChange={v => setFormData({...formData, googleAnalytics: v})} 
                  />

                  <div style={{ borderTop: "1px solid #f0f2f5", paddingTop: 20, marginTop: 10 }}>
                     <Toggle 
                        label="Modo de Manutenção" 
                        desc="Desativa o acesso público ao website temporariamente."
                        active={formData.maintenanceMode}
                        onToggle={() => setFormData({...formData, maintenanceMode: !formData.maintenanceMode})}
                     />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "seguranca" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                 <SectionHeader 
                  title="Acesso e Segurança" 
                  desc="Gerencie sua senha e métodos de autenticação." 
                />
                <div style={{ display: "grid", gap: 24 }}>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "#f8f9fa", borderRadius: 12 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL }}>Palavra-passe</p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: SLATE }}>Última alteração: há 3 meses</p>
                      </div>
                      <button style={{ background: "#fff", border: "1px solid #eef0f3", padding: "8px 16px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                         Alterar
                      </button>
                   </div>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Lock size={18} color={GOLD} />
                        <div>
                          <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL }}>Autenticação de 2 Fatores</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: SLATE, maxWidth: 300 }}>Uma camada extra de proteção para sua conta.</p>
                        </div>
                      </div>
                      <button style={{ background: GOLD, border: "none", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                         Ativar
                      </button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notificacoes" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                 <SectionHeader 
                  title="Notificações de Sistema" 
                  desc="Escolha quais alertas deseja receber por e-mail." 
                />
                <div style={{ display: "grid", gap: 16 }}>
                   <Toggle label="Novas Encomendas" desc="Receber e-mail assim que um cliente compra uma obra." active={true} onToggle={() => {}} />
                   <Toggle label="Mensagens de Contacto" desc="Receber aviso de novos contactos via formulário." active={true} onToggle={() => {}} />
                   <Toggle label="Novos Assinantes" desc="Resumo Diário de subscrições na newsletter." active={false} onToggle={() => {}} />
                </div>
              </motion.div>
            )}

            <div style={{ marginTop: 40, borderTop: "1px solid #f0f0f0", paddingTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button 
                onClick={handleSave}
                disabled={loading}
                style={{ 
                  background: CHARCOAL, color: "#fff", border: "none", 
                  padding: "12px 32px", borderRadius: 12, fontSize: "0.85rem", 
                  fontWeight: 700, cursor: loading ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: loading ? 0.7 : 1, transition: "all 0.2s"
                }}
              >
                {loading ? <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Save size={16} />}
                Guardar Alterações
              </button>
            </div>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      ` }} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ active, label, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderRadius: 12, border: "none", background: active ? `${GOLD}10` : "transparent",
        color: active ? GOLD : SLATE, fontWeight: active ? 700 : 500, fontSize: "0.85rem",
        cursor: "pointer", transition: "all 0.2s", textAlign: "left"
      }}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      {label}
    </button>
  );
}

function SectionHeader({ title, desc }: { title: string, desc: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: CHARCOAL, margin: 0 }}>{title}</h3>
      <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: SLATE }}>{desc}</p>
      <div style={{ height: 1, width: "100%", background: "#f0f2f5", marginTop: 20 }} />
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      <input 
        type="text" 
        value={value} 
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ 
          padding: "12px 16px", borderRadius: 12, border: "1px solid #eef0f3", 
          fontSize: "0.9rem", outline: "none", background: "#fbfcfd",
          transition: "border-color 0.2s"
        }}
        onFocus={e => e.currentTarget.style.borderColor = GOLD}
        onBlur={e => e.currentTarget.style.borderColor = "#eef0f3"}
      />
    </div>
  );
}

function Toggle({ label, desc, active, onToggle }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
       <div>
         <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL }}>{label}</p>
         <p style={{ margin: 0, fontSize: "0.75rem", color: SLATE }}>{desc}</p>
       </div>
       <button 
        onClick={onToggle}
        style={{ 
          width: 44, height: 24, borderRadius: 12, border: "none", 
          background: active ? GOLD : "#E2E8F0", padding: 2,
          cursor: "pointer", transition: "all 0.3s", position: "relative"
        }}
       >
         <div style={{ 
           width: 20, height: 20, borderRadius: "50%", background: "#fff",
           transform: active ? "translateX(20px)" : "translateX(0)",
           transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
         }} />
       </button>
    </div>
  );
}
