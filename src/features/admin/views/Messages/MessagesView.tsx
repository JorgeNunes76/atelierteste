import { useState, useEffect } from "react";
import { getContactosAdmin, getNewsletterAdmin, marcarContactoLido, deleteContacto, toggleNewsletterStatus } from "../../../../lib/db";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Trash2, CheckCircle2, MessageSquare, List, MapPin, Phone, User, Clock, Check, X } from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD, SLATE } from "../../../../lib/tokens";

export function MensagensSection() {
  const [activeTab, setActiveTab] = useState<"mensagens" | "newsletter">("mensagens");
  const [loading, setLoading] = useState(true);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      if (activeTab === "mensagens") {
        const data = await getContactosAdmin();
        setMensagens(data);
      } else {
        const data = await getNewsletterAdmin();
        setSubscribers(data);
      }
    } catch (e) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  const handleMarcarLido = async (id: string) => {
    try {
      await marcarContactoLido(id);
      setMensagens(prev => prev.map(m => m.id === id ? { ...m, lido: true } : m));
      toast.success("Mensagem marcada como lida.");
    } catch (e) {
      toast.error("Ocorreu um erro.");
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await deleteContacto(id);
      setMensagens(prev => prev.filter(m => m.id !== id));
      toast.success("Mensagem eliminada.");
    } catch (e) {
      toast.error("Erro ao eliminar.");
    }
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: "0.75rem", color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Comunicação
        </p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a2130", margin: 0 }}>Gestão de Mensagens</h1>
      </div>

       {/* Tabs */}
       <div style={{ 
        display: "flex", 
        gap: 8, 
        background: "#f0f2f5", 
        padding: 6, 
        borderRadius: 14, 
        marginBottom: 32,
        width: "fit-content"
      }}>
        <button
          onClick={() => setActiveTab("mensagens")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none",
            background: activeTab === "mensagens" ? "#fff" : "transparent",
            color: activeTab === "mensagens" ? GOLD : SLATE,
            fontWeight: activeTab === "mensagens" ? 600 : 500,
            fontSize: "0.85rem", cursor: "pointer",
            boxShadow: activeTab === "mensagens" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <MessageSquare size={16} /> Contactos do Site {mensagens.filter(m => !m.lido).length > 0 && `(${mensagens.filter(m => !m.lido).length})`}
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none",
            background: activeTab === "newsletter" ? "#fff" : "transparent",
            color: activeTab === "newsletter" ? GOLD : SLATE,
            fontWeight: activeTab === "newsletter" ? 600 : 500,
            fontSize: "0.85rem", cursor: "pointer",
            boxShadow: activeTab === "newsletter" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
            transition: "all 0.2s"
          }}
        >
          <Mail size={16} /> Assinantes Newsletter ({subscribers.length})
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 100, textAlign: "center", color: SLATE }}>A carregar dados...</div>
      ) : (
        <div style={{ maxWidth: 1200 }}>
          {activeTab === "mensagens" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mensagens.map((msg) => (
                <MessageCard 
                  key={msg.id} 
                  msg={msg} 
                  onMarkRead={() => handleMarcarLido(msg.id)} 
                  onDelete={() => handleEliminar(msg.id)}
                />
              ))}
              {mensagens.length === 0 && (
                <div style={{ padding: 80, textAlign: "center", background: "#fff", borderRadius: 20, border: "1px dashed #ced4da" }}>
                  <p style={{ color: SLATE, margin: 0 }}>Nenhuma mensagem recebida ainda.</p>
                </div>
              )}
            </div>
          ) : (
             <Card>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", borderBottom: "1px solid #eef0f3" }}>
                        <th style={thStyle}>Data</th>
                        <th style={thStyle}>E-mail</th>
                        <th style={thStyle}>Estado</th>
                        <th style={thStyle}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s, idx) => (
                        <tr key={s.id} style={{ borderBottom: idx === subscribers.length - 1 ? "none" : "1px solid #f8f9fa" }}>
                           <td style={tdStyle}>{new Date(s.created_at).toLocaleDateString("pt-PT")}</td>
                           <td style={tdStyle}>{s.email}</td>
                           <td style={tdStyle}>
                              <span style={{ 
                                padding: "4px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700,
                                background: s.ativo ? "#ecfdf5" : "#fef2f2",
                                color: s.ativo ? "#10b981" : "#ef4444" 
                              }}>
                                {s.ativo ? "Ativo" : "Cancelado"}
                              </span>
                           </td>
                           <td style={tdStyle}>
                              <button style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>
                                <Trash2 size={16} />
                              </button>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function MessageCard({ msg, onMarkRead, onDelete }: { msg: any; onMarkRead: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      style={{
        background: msg.lido ? "#fff" : "rgba(201,169,110,0.03)",
        borderRadius: 20,
        border: "1px solid",
        borderColor: msg.lido ? "#eef0f3" : GOLD,
        padding: "24px 32px",
        position: "relative",
        boxShadow: msg.lido ? "0 4px 12px rgba(0,0,0,0.02)" : "0 4px 20px rgba(201,169,110,0.1)"
      }}
    >
      {!msg.lido && (
        <span style={{ position: "absolute", top: 24, left: 16, width: 8, height: 8, borderRadius: "50%", background: GOLD }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
        <div>
           <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#1a2130" }}>{msg.nome}</h3>
              {msg.assunto && <span style={{ padding: "4px 10px", borderRadius: 8, background: "#f1f3f5", color: SLATE, fontSize: "0.65rem", fontWeight: 600 }}>{msg.assunto}</span>}
           </div>
           <div style={{ display: "flex", alignItems: "center", gap: 16, color: SLATE, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={14} /> {msg.email}</div>
              {msg.telefone && <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={14} /> {msg.telefone}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {new Date(msg.created_at).toLocaleString("pt-PT")}</div>
           </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {!msg.lido && (
            <button
              onClick={onMarkRead}
              title="Marcar como lida"
              style={{ padding: 12, borderRadius: 12, background: GOLD, color: "#fff", border: "none", cursor: "pointer" }}
            >
              <CheckCircle2 size={18} />
            </button>
          )}
           <button
            onClick={onDelete}
            title="Eliminar permanentemente"
            style={{ padding: 12, borderRadius: 12, background: "#fef2f2", color: "#ef4444", border: "none", cursor: "pointer" }}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div style={{ 
        padding: 20, 
        background: "#fbfcfd", 
        borderRadius: 12, 
        border: "1px solid #f1f3f5",
        color: "#4a5568",
        fontSize: "0.95rem",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap"
      }}>
        {msg.mensagem}
      </div>
    </motion.div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #eef0f3", padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      {children}
    </div>
  );
}

const thStyle = {
  padding: "16px 20px",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: SLATE,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const tdStyle = {
  padding: "16px 20px",
  fontSize: "0.85rem",
  color: "#333",
};
