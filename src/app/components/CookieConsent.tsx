import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Cookie, ShieldCheck } from "lucide-react";

import { GOLD } from "../../lib/tokens";
const STORAGE_KEY = "aa_cookie_consent";

type ConsentState = { analytics: boolean; marketing: boolean } | null;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) setTimeout(() => setVisible(true), 1200);
  }, []);

  const save = (consent: ConsentState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setVisible(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: false });
  const acceptSelected = () => save({ analytics, marketing: false });
  const rejectAll = () => save({ analytics: false, marketing: false });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            width: "min(calc(100vw - 32px), 560px)",
            background: "#1A1A1A",
            borderRadius: 16,
            boxShadow: "0 8px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(196,149,106,0.2)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Gold top bar */}
          <div style={{ height: 3, background: `linear-gradient(90deg, ${GOLD}, #E8C98A, ${GOLD})` }} />

          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: `${GOLD}20`,
                border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <Cookie size={16} color={GOLD} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFF", margin: "0 0 4px" }}>
                  Este site utiliza cookies
                </p>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
                  Utilizamos cookies essenciais para o funcionamento do site e, com o teu consentimento, cookies analíticos para melhorar a experiência.{" "}
                  <Link to="/privacidade" style={{ color: GOLD, textDecoration: "underline" }}>Política de Privacidade</Link>
                </p>
              </div>
              <button onClick={rejectAll} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 2, flexShrink: 0 }}>
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Details toggle */}
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                style={{ marginBottom: 14, padding: "12px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10 }}
              >
                {/* Essential - always on */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#FFF", margin: "0 0 2px" }}>Essenciais</p>
                    <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Necessários para o funcionamento do site</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={13} color={GOLD} strokeWidth={1.5} />
                    <span style={{ fontSize: "0.65rem", color: GOLD, fontWeight: 600 }}>Sempre ativo</span>
                  </div>
                </div>
                {/* Analytics - toggleable */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#FFF", margin: "0 0 2px" }}>Analíticos</p>
                    <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Ajudam a perceber como o site é usado</p>
                  </div>
                  <button
                    onClick={() => setAnalytics(v => !v)}
                    style={{
                      width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                      background: analytics ? GOLD : "rgba(255,255,255,0.15)",
                      position: "relative", transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", background: "#FFF",
                      position: "absolute", top: 3,
                      left: analytics ? 21 : 3,
                      transition: "left 0.2s",
                    }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowDetails(v => !v)}
                style={{
                  flex: 1, minWidth: 100, padding: "9px 14px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)", background: "transparent",
                  color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {showDetails ? "Fechar" : "Personalizar"}
              </button>
              {showDetails && (
                <button
                  onClick={acceptSelected}
                  style={{
                    flex: 1, minWidth: 100, padding: "9px 14px", borderRadius: 8,
                    border: `1px solid ${GOLD}50`, background: `${GOLD}15`,
                    color: GOLD, fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                  }}
                >
                  Guardar preferências
                </button>
              )}
              <button
                onClick={acceptAll}
                style={{
                  flex: 1, minWidth: 100, padding: "9px 14px", borderRadius: 8,
                  border: "none", background: GOLD,
                  color: "#1A1A1A", fontSize: "0.72rem", cursor: "pointer", fontWeight: 700,
                }}
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook para verificar consentimento
export function useConsent() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { analytics: false, marketing: false };
  try { return JSON.parse(raw) as { analytics: boolean; marketing: boolean }; }
  catch { return { analytics: false, marketing: false }; }
}
