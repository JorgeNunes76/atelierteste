import { useState, useEffect } from "react";
import { getVendasAdmin, updateVendaEstado } from "../../../../lib/db";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingBag, 
  Search, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XSquare, 
  MoreVertical,
  Calendar,
  User,
  Mail,
  MapPin,
  ChevronRight
} from "lucide-react";
import { toast } from "../../../../lib/toast";

import { GOLD } from "../../../../lib/tokens";

interface Venda {
  id: string;
  created_at: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_tel: string | null;
  total: number;
  items: Array<{ id: string; titulo: string; preco: number }>;
  morada: string | null;
  estado: 'pendente' | 'pago' | 'enviado' | 'cancelado';
}

export default function VendasSection() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);

  useEffect(() => {
    fetchVendas();
  }, []);

  async function fetchVendas() {
    try {
      setLoading(true);
      const data = await getVendasAdmin();
      setVendas(data as Venda[]);
    } catch (err) {
      if (import.meta.env?.DEV) console.error(err);
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  }

  async function updateEstado(id: string, novoEstado: Venda['estado']) {
    try {
      await updateVendaEstado(id, novoEstado);
      setVendas(prev => prev.map(v => v.id === id ? { ...v, estado: novoEstado } : v));
      if (selectedVenda?.id === id) setSelectedVenda({ ...selectedVenda, estado: novoEstado });
      toast.success(`Estado atualizado para ${novoEstado}`);
    } catch (err) {
      if (import.meta.env?.DEV) console.error(err);
      toast.error("Erro ao atualizar estado");
    }
  }

  const filteredVendas = vendas.filter(v => {
    const matchesSearch = v.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.cliente_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "todos" || v.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const getEstadoBadge = (estado: Venda['estado']) => {
    const styles: Record<string, { bg: string, color: string, icon: any, label: string }> = {
      pendente: { bg: "#FFFBEB", color: "#B45309", icon: Clock, label: "Pendente" },
      pago: { bg: "#ECFDF5", color: "#047857", icon: CheckCircle2, label: "Pago" },
      enviado: { bg: "#EFF6FF", color: "#1D4ED8", icon: Truck, label: "Enviado" },
      cancelado: { bg: "#FEF2F2", color: "#B91C1C", icon: XSquare, label: "Cancelado" },
    };
    const s = styles[estado];
    const Icon = s.icon;
    return (
      <span style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: 6, 
        padding: "4px 10px", 
        borderRadius: 20, 
        background: s.bg, 
        color: s.color, 
        fontSize: "0.7rem", 
        fontWeight: 500 
      }}>
        <Icon size={12} />
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ padding: "0 4px" }}>
      {/* Header com Filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, color: "#1a1a1a", display: "flex", alignItems: "center", gap: 12 }}>
            <ShoppingBag size={24} color={GOLD} />
            Gestão de Vendas
          </h2>
          <p style={{ color: "#718096", fontSize: "0.85rem", marginTop: 4 }}>
            Monitorize e processe as encomendas do atelier.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A0AEC0" }} size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                padding: "10px 12px 10px 40px", 
                borderRadius: 8, 
                border: "1px solid #E2E8F0", 
                fontSize: "0.85rem",
                width: 240,
                outline: "none"
              }}
            />
          </div>
          <select 
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{ 
              padding: "10px 16px", 
              borderRadius: 8, 
              border: "1px solid #E2E8F0", 
              fontSize: "0.85rem",
              background: "#fff",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="todos">Todos os Estados</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="enviado">Enviado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "100px 0", textAlign: "center", color: "#A0AEC0" }}>Carregando vendas...</div>
      ) : filteredVendas.length === 0 ? (
        <div style={{ padding: "100px 24px", textAlign: "center", background: "#fcfcfb", border: "1px dashed #E2E8F0", borderRadius: 12 }}>
          <ShoppingBag size={48} style={{ color: "#E2E8F0", margin: "0 auto 16px" }} />
          <p style={{ color: "#718096" }}>Nenhuma venda encontrada.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#F7FAFC", borderBottom: "1px solid #E2E8F0" }}>
              <tr>
                <th style={{ padding: "16px 20px", fontSize: "0.7rem", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" }}>Data / ID</th>
                <th style={{ padding: "16px 20px", fontSize: "0.7rem", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" }}>Cliente</th>
                <th style={{ padding: "16px 20px", fontSize: "0.7rem", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" }}>Itens</th>
                <th style={{ padding: "16px 20px", fontSize: "0.7rem", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" }}>Total</th>
                <th style={{ padding: "16px 20px", fontSize: "0.7rem", textTransform: "uppercase", color: "#718096", letterSpacing: "0.05em" }}>Estado</th>
                <th style={{ padding: "16px 20px", textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredVendas.map((venda) => (
                <tr key={venda.id} style={{ borderBottom: "1px solid #F7FAFC", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#fafafa"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#1a1a1a", fontWeight: 500 }}>
                      {new Date(venda.created_at).toLocaleDateString('pt-PT')}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#A0AEC0", marginTop: 4 }}>
                      ID: {venda.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td style={{ padding: "20px" }}>
                    <div style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{venda.cliente_nome}</div>
                    <div style={{ fontSize: "0.75rem", color: "#718096" }}>{venda.cliente_email}</div>
                  </td>
                  <td style={{ padding: "20px" }}>
                    <div style={{ fontSize: "0.8rem", color: "#1a1a1a" }}>
                      {venda.items.length} {venda.items.length === 1 ? "obra" : "obras"}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#A0AEC0", marginTop: 2 }}>
                      {venda.items.map(i => i.titulo).join(", ").slice(0, 30)}...
                    </div>
                  </td>
                  <td style={{ padding: "20px" }}>
                    <div style={{ fontSize: "0.9rem", color: GOLD, fontWeight: 600 }}>
                      €{venda.total.toLocaleString('pt-PT')}
                    </div>
                  </td>
                  <td style={{ padding: "20px" }}>
                    {getEstadoBadge(venda.estado)}
                  </td>
                  <td style={{ padding: "20px", textAlign: "right" }}>
                    <button 
                      onClick={() => setSelectedVenda(venda)}
                      style={{ 
                        padding: "8px 12px", 
                        borderRadius: 6, 
                        border: "1px solid #E2E8F0", 
                        background: "#fff", 
                        color: "#4A5568", 
                        fontSize: "0.75rem", 
                        cursor: "pointer", 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: 6 
                      }}
                    >
                      Detalhes
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedVenda && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedVenda(null)}
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: "relative", width: "100%", maxWidth: 640, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
            >
              {/* Modal Header */}
              <div style={{ padding: "24px 32px", borderBottom: "1px solid #E2E8F0", background: "#F7FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1a1a1a" }}>Pedido #{selectedVenda.id.slice(0, 8)}</h3>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: "0.75rem", color: "#718096", display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={14} />
                      {new Date(selectedVenda.created_at).toLocaleString('pt-PT')}
                    </span>
                    {getEstadoBadge(selectedVenda.estado)}
                  </div>
                </div>
                <button onClick={() => setSelectedVenda(null)} style={{ border: "none", background: "none", color: "#A0AEC0", cursor: "pointer" }}>
                  <XSquare size={24} />
                </button>
              </div>

              {/* Modal Content */}
              <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <h4 style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#718096", marginBottom: 16 }}>Cliente</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <User size={16} color={GOLD} />
                      <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{selectedVenda.cliente_nome}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Mail size={16} color={GOLD} />
                      <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{selectedVenda.cliente_email}</span>
                    </div>
                    {selectedVenda.morada && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <MapPin size={16} color={GOLD} style={{ marginTop: 2 }} />
                        <span style={{ fontSize: "0.85rem", color: "#1a1a1a", lineHeight: 1.5 }}>{selectedVenda.morada}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#718096", marginBottom: 16 }}>Obras Adquiridas</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {selectedVenda.items.map(item => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F7FAFC" }}>
                        <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{item.titulo}</span>
                        <span style={{ fontSize: "0.85rem", color: GOLD, fontWeight: 500 }}>€{item.preco.toLocaleString('pt-PT')}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 12, borderTop: "2px solid #F7FAFC" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Total</span>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: GOLD }}>€{selectedVenda.total.toLocaleString('pt-PT')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Actions) */}
              <div style={{ padding: "24px 32px", background: "#F7FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <p style={{ marginRight: "auto", fontSize: "0.75rem", color: "#718096", alignSelf: "center" }}>Alterar estado para:</p>
                
                {['pendente', 'pago', 'enviado', 'cancelado'].map((e) => (
                  <button 
                    key={e}
                    onClick={() => updateEstado(selectedVenda.id, e as Venda['estado'])}
                    disabled={selectedVenda.estado === e}
                    style={{ 
                      padding: "8px 16px", 
                      borderRadius: 8, 
                      border: "1px solid #E2E8F0", 
                      background: selectedVenda.estado === e ? "#E2E8F0" : "#fff",
                      color: selectedVenda.estado === e ? "#718096" : "#1a1a1a",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      cursor: selectedVenda.estado === e ? "default" : "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
