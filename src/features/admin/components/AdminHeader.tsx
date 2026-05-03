import { motion } from "motion/react";
import { Bell, Search, LayoutGrid, List } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  viewMode?: "grid" | "list";
  setViewMode?: (mode: "grid" | "list") => void;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

import { GOLD } from "../../../lib/tokens";

export function AdminHeader({ title, viewMode, setViewMode, onSearchChange, searchValue }: AdminHeaderProps) {
  return (
    <header
      style={{
        height: 72,
        background: "#fff",
        borderBottom: "1px solid #eef0f3",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 90,
      }}
    >
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a2130", margin: 0 }}>
          {title}
        </h2>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Search bar */}
        {onSearchChange && (
          <div style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#99a1af",
              }}
            />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: "#f8f9fa",
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: "10px 16px 10px 40px",
                fontSize: "0.85rem",
                width: 280,
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>
        )}

        {/* View toggler */}
        {setViewMode && (
          <div
            style={{
              display: "flex",
              background: "#f0f2f5",
              padding: 4,
              borderRadius: 10,
              gap: 2,
            }}
          >
            <button
              onClick={() => setViewMode("grid")}
              style={{
                border: "none",
                background: viewMode === "grid" ? "#fff" : "transparent",
                color: viewMode === "grid" ? GOLD : "#99a1af",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: viewMode === "grid" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                border: "none",
                background: viewMode === "list" ? "#fff" : "transparent",
                color: viewMode === "list" ? GOLD : "#99a1af",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                boxShadow: viewMode === "list" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              <List size={16} />
            </button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#99a1af",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={20} />
            <span
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 8,
                height: 8,
                background: "#EF4444",
                borderRadius: "50%",
                border: "2px solid #fff",
              }}
            />
          </button>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #C9A96E 0%, #e0c48a 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              boxShadow: "0 4px 12px rgba(201,169,110,0.25)",
            }}
          >
            AA
          </div>
        </div>
      </div>
    </header>
  );
}
