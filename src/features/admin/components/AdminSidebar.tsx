import { motion, AnimatePresence } from "motion/react";
import {
  Palette, LayoutDashboard, FileText, Settings, Users,
  MessageSquare, ShoppingBag, LogOut, ChevronLeft, ChevronRight, Globe, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../../../lib/auth";

import { GOLD } from "../../../lib/tokens";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile?: boolean;
}

export function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, isMobile }: AdminSidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "home", label: "Painel Principal", Icon: LayoutDashboard },
    { id: "obras", label: "Gestão de Obras", Icon: Palette },
    { id: "vendas", label: "Vendas e Encomendas", Icon: ShoppingBag },
    { id: "conteudos", label: "Editar o Website", Icon: FileText },
    { id: "msgs", label: "Mensagens & Email", Icon: MessageSquare },
    { id: "membros", label: "Base de Clientes", Icon: Users },
    { id: "settings", label: "Definições", Icon: Settings },
  ];

  // On mobile: hamburger button to open sidebar (when closed)
  if (isMobile && !sidebarOpen) {
    return (
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          position: "fixed", top: 12, left: 12, zIndex: 101,
          width: 40, height: 40, borderRadius: 8,
          background: "#1a1c1e", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
        }}
      >
        <Menu size={20} />
      </button>
    );
  }

  return (
    <motion.aside
      initial={isMobile ? { x: -260 } : false}
      animate={{ width: isMobile ? 260 : sidebarOpen ? 260 : 80, x: 0 }}
      exit={isMobile ? { x: -260 } : undefined}
      style={{
        background: "#1a1c1e",
        color: "#fff",
        height: "100vh",
        position: isMobile ? "fixed" : "sticky",
        top: 0,
        left: 0,
        zIndex: 100,
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Header */}
      <div style={{ 
        padding: sidebarOpen ? "28px 24px" : "28px 0", 
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8
      }}>
        {sidebarOpen ? (
          <>
            <h1 style={{ 
              fontFamily: "var(--font-serif)", 
              fontSize: "1.2rem", 
              letterSpacing: "0.08em",
              margin: 0,
              color: GOLD
            }}>
              ANA ALEXANDRE
            </h1>
            <p style={{ fontSize: "0.55rem", letterSpacing: "0.25em", opacity: 0.5, textTransform: "uppercase" }}>
              Panel de Controlo
            </p>
          </>
        ) : (
          <div style={{ 
            width: 32, height: 32, borderRadius: "50%", 
            background: GOLD, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "0.9rem"
          }}>
            A
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        {menuItems.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: sidebarOpen ? "14px 20px" : "14px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: isActive ? "rgba(201,169,110,0.15)" : "transparent",
                color: isActive ? GOLD : "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 4,
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <Icon size={20} />
              {sidebarOpen && (
                <span style={{ fontSize: "0.85rem", fontWeight: isActive ? 600 : 400 }}>
                  {label}
                </span>
              )}
              {isActive && sidebarOpen && (
                <motion.div
                  layoutId="active-pill"
                  style={{
                    position: "absolute",
                    left: 0,
                    width: 3,
                    height: 20,
                    background: GOLD,
                    borderRadius: "0 4px 4px 0"
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: sidebarOpen ? "14px 20px" : "14px 0",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Globe size={18} />
          {sidebarOpen && <span style={{ fontSize: "0.82rem" }}>Ver Website</span>}
        </button>

        <button
          onClick={async () => {
             await signOut();
             navigate("/login");
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: sidebarOpen ? "14px 20px" : "14px 0",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            background: "rgba(239,68,68,0.1)",
            color: "#EF4444",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          <LogOut size={18} />
          {sidebarOpen && <span style={{ fontSize: "0.82rem" }}>Terminar Sessão</span>}
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            marginTop: 12,
            width: "100%",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.2)",
            cursor: "pointer",
          }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
