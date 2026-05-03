import { useState, useEffect } from "react";
import { getStatsAdmin, getVendasAdmin, getContactosAdmin } from "../../../../lib/db";
import { motion } from "motion/react";
import { 
  Palette, MessageSquare, Mail, TrendingUp, 
  Clock, ArrowUpRight, ArrowDownRight, Package, 
  ShoppingCart, Users, CreditCard, ChevronRight,
  Plus, Phone, Globe, Sparkles, LayoutDashboard, Settings,
  Activity, CheckCircle2, AlertTriangle, ExternalLink
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from "recharts";

import { GOLD, SLATE, CHARCOAL } from "../../../../lib/tokens";

// ── Traffic Data ─────────────────────────────────────────────────────────────
const TRAFFIC_SOURCES = [
  { name: "Instagram", value: 45, color: "#E1306C" },
  { name: "Facebook",  value: 25, color: "#1877F2" },
  { name: "Pinterest", value: 20, color: "#E60023" },
  { name: "Direto/SEO", value: 10, color: "#C9A96E" }
];

export function DashboardHome({ setScreen, globalSearch }: { setScreen: (s: any) => void, globalSearch: string }) {
  const [stats, setStats] = useState({
    totalObras: 0,
    mensagensNaoLidas: 0,
    totalNewsletter: 0,
    vendasTotal: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, vendas, contactos] = await Promise.all([
          getStatsAdmin(),
          getVendasAdmin(),
          getContactosAdmin()
        ]);
        
        setStats(statsData);
        
        // Process sales for chart (last 6 months)
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const salesByMonth = vendas.reduce((acc: any, v) => {
          const m = new Date(v.created_at).getMonth();
          acc[m] = (acc[m] || 0) + (v.total || 0);
          return acc;
        }, {});
        
        const chartData = months.map((m, i) => ({
          name: m,
          valor: salesByMonth[i] || 0
        })).slice(-7); // Last 7 months
        
        setSalesData(chartData);

        // Process activity feed
        const activity = [
          ...contactos.slice(0, 3).map(c => ({ 
            type: "msg", time: c.created_at, label: "Mensagem de:", user: c.nome, status: c.lido ? "Lido" : "Novo" 
          })),
          ...vendas.slice(0, 3).map(v => ({ 
            type: "venda", time: v.created_at, label: "Venda registada:", user: `Encomenda #${v.id.slice(0,4)}`, status: v.estado 
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
        
        setRecentActivity(activity);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cards = [
    { label: "Obras no Acervo", value: stats.totalObras, icon: Palette, color: GOLD, trend: "+2 este mês" },
    { label: "Mensagens Pendentes", value: stats.mensagensNaoLidas, icon: MessageSquare, color: "#EF4444", trend: stats.mensagensNaoLidas > 0 ? "Ação Requerida" : "Em dia" },
    { label: "Assinantes News", value: stats.totalNewsletter, icon: Mail, color: "#3B82F6", trend: "Crescimento de 12%" },
    { label: "Volume de Vendas", value: `€${stats.vendasTotal.toLocaleString('pt-PT')}`, icon: TrendingUp, color: "#10B981", trend: "Recorde anual" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <header style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
             <Sparkles size={14} color={GOLD} />
             <p style={{ fontSize: "0.7rem", color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
               Painel de Gestão Editorial
             </p>
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: CHARCOAL, margin: 0, fontFamily: "var(--font-serif)" }}>
            Bem-vinda, <span style={{ color: GOLD }}>Ana Alexandre</span>
          </h1>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
           <a href="/" target="_blank" style={{ textDecoration: "none" }}>
              <button style={secondaryButtonStyle}><ExternalLink size={14} /> Ver Website</button>
           </a>
           <button onClick={() => setScreen("obras")} style={primaryButtonStyle}><Plus size={14} /> Adicionar Obra</button>
        </div>
      </header>

      {/* QUICK ACTIONS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
         <button onClick={() => setScreen("obras")} style={actionCardVariant(CHARCOAL)}>
            <div style={iconBoxStyle(GOLD)}>
               <Palette size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", margin: "16px 0 8px" }}>Gerir Acervo</h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>Catálogo completo de pinturas e esculturas.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: GOLD, fontSize: "0.75rem", fontWeight: 600 }}>
              Explorar Inventário <ArrowUpRight size={14} />
            </div>
         </button>

         <button onClick={() => setScreen("conteudos")} style={actionCardVariant("#fff")}>
            <div style={iconBoxStyle(GOLD)}>
               <LayoutDashboard size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: CHARCOAL, margin: "16px 0 8px" }}>Editar Website</h3>
            <p style={{ fontSize: "0.8rem", color: SLATE, margin: "0 0 16px" }}>Atualizar textos, imagens e biografia oficial.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: GOLD, fontSize: "0.75rem", fontWeight: 600 }}>
              Painel CMS <ArrowUpRight size={14} />
            </div>
         </button>

         <button onClick={() => setScreen("msgs")} style={actionCardVariant("#fff")}>
            <div style={iconBoxStyle("#3B82F6")}>
               <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: CHARCOAL, margin: "16px 0 8px" }}>Mensagens</h3>
            <p style={{ fontSize: "0.8rem", color: SLATE, margin: "0 0 16px" }}>Interações recentes e pedidos de orientação.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#3B82F6", fontSize: "0.75rem", fontWeight: 600 }}>
              Abrir Inbox <ArrowUpRight size={14} />
            </div>
         </button>

         <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #f0f0f0", padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Activity size={16} color={GOLD} />
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: SLATE, textTransform: "uppercase", letterSpacing: "0.1em" }}>Estado do Sistema</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: "0.85rem", fontWeight: 600 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B98180" }} />
                Website Online
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: SLATE, marginBottom: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Globe size={10} /> Tráfego Diário</span>
                <span style={{ color: CHARCOAL, fontWeight: 700 }}>Saudável</span>
              </div>
              <div style={{ height: 6, width: "100%", background: "#f0f2f5", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "84%", background: GOLD, borderRadius: 3 }} />
              </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 48 }}>
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={statCardStyle}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: 16, 
                  background: `${card.color}10`, color: card.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `inset 0 0 0 1px ${card.color}20`
                }}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: SLATE, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</p>
                  <h3 style={{ margin: "4px 0", fontSize: "1.85rem", fontWeight: 800, color: CHARCOAL, letterSpacing: "-0.02em" }}>{card.value}</h3>
                  <span style={{ fontSize: "0.65rem", color: card.color, fontWeight: 700, opacity: 0.8 }}>
                    {card.trend}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Card title="Performance Financeira (Últimos 7 meses)">
             <div style={{ width: "100%", height: 320, marginTop: 20 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={salesData}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor={GOLD} stopOpacity={0.2}/>
                       <stop offset="95%" stopColor={GOLD} stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: SLATE }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: SLATE }} tickFormatter={(v) => `€${v}`} />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="valor" stroke={GOLD} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <Card title="Tráfego por Rede">
                <div style={{ height: 260, position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={TRAFFIC_SOURCES} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {TRAFFIC_SOURCES.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <Globe size={24} color="#f0f0f0" />
                    </div>
                </div>
                <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                   {TRAFFIC_SOURCES.map(source => (
                     <div key={source.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.7rem", color: SLATE }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: source.color }} />
                        {source.name}
                     </div>
                   ))}
                </div>
             </Card>

             <Card title="Atalhos Rápidos">
                <div style={{ display: "grid", gap: 12 }}>
                   <QuickLink label="Exportar Relatórios" sub="CSV, PDF, Excel" icon={Package} />
                   <QuickLink label="Base de Membros" sub="Gestão de clientes" icon={Users} />
                   <QuickLink label="Definições" sub="Configuração global" icon={Settings} />
                </div>
             </Card>
          </div>
        </div>

        <Card title="Atividade Recente">
           <div style={{ display: "flex", flexDirection: "column" }}>
              {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                <div key={idx} style={{ 
                  display: "flex", alignItems: "center", gap: 16, padding: "20px 0",
                  borderBottom: idx === recentActivity.length - 1 ? "none" : "1px solid #f8f9fa" 
                }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F8FAF8", display: "flex", alignItems: "center", justifyContent: "center", color: item.type === "venda" ? "#10B981" : GOLD, border: "1px solid #EEF2EE" }}>
                      {item.type === "venda" ? <ShoppingCart size={18} /> : <MessageSquare size={18} />}
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: CHARCOAL, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ color: SLATE, fontWeight: 400 }}>{item.label} </span>
                        {item.user}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.72rem", color: SLATE }}>{new Date(item.time).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                   <Badge label={item.status} color={item.status === "Novo" ? GOLD : SLATE} />
                </div>
              )) : (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                   <Clock size={32} color="#f0f0f0" style={{ marginBottom: 12 }} />
                   <p style={{ color: SLATE, fontSize: "0.85rem", margin: 0 }}>Sem atividade recente registada.</p>
                </div>
              )}
           </div>
           {recentActivity.length > 0 && (
             <button style={{ 
               width: "100%", padding: "12px", background: "#f8f9fa", border: "none", 
               borderRadius: 12, color: GOLD, fontSize: "0.8rem", fontWeight: 700, 
               marginTop: 24, cursor: "pointer"
             }}>
               Ver Histórico Completo
             </button>
           )}
        </Card>
      </div>
    </div>
  );
}

// ── UI Components ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 28, border: "1px solid #f0f0f0", padding: 32, boxShadow: "0 12px 40px rgba(0,0,0,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, margin: 0, color: CHARCOAL, letterSpacing: "-0.01em" }}>{title}</h2>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={14} color={SLATE} />
        </div>
      </div>
      {children}
    </div>
  );
}

function QuickLink({ label, sub, icon: Icon }: { label: string; sub: string; icon: any }) {
  return (
    <button style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px",
      borderRadius: 16, border: "1px solid #f5f5f5", background: "#fff",
      cursor: "pointer", transition: "all 0.2s", textAlign: "left",
      boxShadow: "0 2px 8px rgba(0,0,0,0.01)"
    }}
    onMouseEnter={e => { (e.currentTarget.style.borderColor = GOLD); (e.currentTarget.style.boxShadow = "0 8px 20px rgba(201,169,110,0.1)"); }}
    onMouseLeave={e => { (e.currentTarget.style.borderColor = "#f5f5f5"); (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.01)"); }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${GOLD}10`, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: CHARCOAL }}>{label}</p>
        <p style={{ margin: 0, fontSize: "0.7rem", color: SLATE }}>{sub}</p>
      </div>
    </button>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ 
      fontSize: "0.6rem", padding: "4px 10px", borderRadius: 8, 
      background: `${color}10`, color: color, fontWeight: 800, 
      textTransform: "uppercase", letterSpacing: "0.05em" 
    }}>
      {label}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1A1A1A", borderRadius: 12, padding: "12px 16px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        <p style={{ margin: 0, fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: GOLD }}>€{payload[0].value.toLocaleString('pt-PT')}</p>
      </div>
    );
  }
  return null;
};

const primaryButtonStyle = {
  background: CHARCOAL, color: "#fff", border: "none", borderRadius: 14,
  padding: "12px 24px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
};

const secondaryButtonStyle = {
  background: "#fff", color: CHARCOAL, border: "1px solid #eef0f3", borderRadius: 14,
  padding: "12px 24px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
  display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
};

const statCardStyle = {
  background: "#fff", borderRadius: 28, padding: "32px",
  border: "1px solid #f0f0f0", boxShadow: "0 8px 30px rgba(0,0,0,0.015)",
  display: "flex", flexDirection: "column" as const
};

const iconBoxStyle = (color: string) => ({
  width: 52, height: 52, borderRadius: 14, background: `${color}15`, 
  color: color, display: "flex", alignItems: "center", justifyContent: "center"
});

const actionCardVariant = (bg: string) => ({
  background: bg, border: "1px solid #f0f0f0", borderRadius: 28, 
  padding: 32, textAlign: "left" as const, cursor: "pointer",
  boxShadow: "0 10px 40px rgba(0,0,0,0.03)", transition: "all 0.2s",
  display: "flex", flexDirection: "column" as const, justifyContent: "flex-start"
});

