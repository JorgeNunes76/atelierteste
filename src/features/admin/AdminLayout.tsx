import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { DashboardHome } from "./views/Dashboard/DashboardView";
import { ObrasSection } from "./views/Artworks/ArtworksView";
import VendasSection from "./views/Sales/SalesView";
import { MensagensSection } from "./views/Messages/MessagesView";
import { ConteudosSection } from "./views/Content/ContentView";
import { SettingsSection } from "./views/Settings/SettingsView";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { 
  Home, Palette, ShoppingCart, MessageSquare, 
  Mail, Users, Settings, LogOut, ChevronRight, 
  Menu, X, Bell, Search, Layout, Globe,
  Plus, Edit2, Trash2, Eye,
  TrendingUp, ArrowUpRight, ArrowDownRight, Check,
  Filter, Download, AlertCircle, BarChart2, Package,
  Send, Lock, CreditCard, Save, RefreshCw,
  Sparkles, ChevronDown, UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../lib/auth";
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const GOLD      = "#C9A96E";
const GOLD_L    = "#D9BC8C";
const CHARCOAL  = "#1A1A1A";
const SLATE     = "#64748B";
const SLATE_L   = "#94A3B8";
const PAGE_BG   = "#F4F6F9";
const SIDEBAR_W = 256;

const NOTIFICATIONS_DATA = [
  { id: 1, type: "order",      title: "Nova encomenda #0042",      desc: "Sofia Mendes · Luz de Inverno",         time: "há 5 min",  read: false },
  { id: 2, type: "message",    title: "Nova mensagem recebida",    desc: "Pedro Alves quer saber sobre orientação", time: "há 23 min", read: false },
  { id: 3, type: "subscriber", title: "Novo subscritor",           desc: "ana.ribeiro@gmail.com subscreveu",      time: "há 1h",     read: true  },
];



// ── Screen Definitions ────────────────────────────────────────────────────────
enum Screen {
  Home = "home",
  Obras = "obras",
  Vendas = "vendas",
  Msgs = "msgs",
  Conteudos = "conteudos",
  Membros = "membros",
  Settings = "settings"
}


const TITLES: Record<string, string> = {
  home: "Painel Principal", 
  obras: "Gestão de Obras", 
  vendas: "Vendas e Encomendas",
  msgs: "Mensagens & Newsletter", 
  conteudos: "Edição do Website",
  membros: "Base de Clientes",
  settings: "Definições de Sistema"
};

// ── Rendering Engine ────────────────────────────────────────────────────────

export function AdminLayout() {
  const [screen, setScreen]       = useState<Screen>(Screen.Home);
  const [sidebarOpen, setSidebar] = useState(true);
  const [globalQ, setGlobalQ]     = useState("");

  const handleSetScreen = (s: string) => {
    setScreen(s as Screen);
    setGlobalQ("");
  };

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: PAGE_BG,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <AdminSidebar
        activeTab={screen}
        setActiveTab={handleSetScreen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebar}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminHeader 
           title={TITLES[screen] || "Painel de Gestão"} 
           onSearchChange={setGlobalQ}
           searchValue={globalQ}
        />
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {screen === Screen.Home       && <DashboardHome setScreen={handleSetScreen} globalSearch={globalQ} />}
              {screen === Screen.Obras      && <ObrasSection globalSearch={globalQ} />}
              {screen === Screen.Vendas     && <VendasSection />}
              {screen === Screen.Msgs       && <MensagensSection />}
              {screen === Screen.Conteudos  && <ConteudosSection />}
              {screen === Screen.Settings   && <SettingsSection />}
              {screen === Screen.Membros    && (
                <div style={{ padding: 40, textAlign: "center" }}>
                   <Users size={64} color="#eef0f3" style={{ marginBottom: 20 }} />
                   <h2 style={{ color: "#1A1A1A" }}>Base de Clientes</h2>
                   <p style={{ color: "#64748B" }}>Esta funcionalidade está a ser migrada do sistema antigo.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        button:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
      `}</style>
    </div>
  );
}
