import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X, Smartphone } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed it in this session or permanently
    if (localStorage.getItem("pwa-prompt-dismissed")) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 30 seconds to not annoy the user immediately
      const timer = setTimeout(() => setShowPrompt(true), 30000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 24 hours (approx) or just the session
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem("pwa-prompt-dismissed", "true");
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "calc(100% - 48px)",
            maxWidth: "400px",
            background: "#FFF",
            borderRadius: "16px",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(196,149,106,0.15)",
          }}
        >
          {/* App Icon placeholder (or logo) */}
          <div style={{ 
            width: 48, height: 48, borderRadius: "12px", 
            background: "linear-gradient(135deg, #1A1A1A 0%, #333 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Smartphone size={24} color="#C9A96E" strokeWidth={1.5} />
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 600, color: "#1A1A1A" }}>Atelier no seu ecrã</h4>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748B" }}>Instale a nossa galeria no telemóvel.</p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleDismiss}
              style={{ background: "transparent", border: "none", color: "#BBB", cursor: "pointer", padding: "8px" }}
            >
              <X size={18} />
            </button>
            <button
              onClick={handleInstall}
              style={{
                background: "#C9A96E",
                color: "#FFF",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              <Download size={14} /> Instalar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
