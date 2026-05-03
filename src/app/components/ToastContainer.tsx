import { useToasts, toast } from "../../lib/toast";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

import { GOLD } from "../../lib/tokens";

export function ToastContainer() {
  const toasts = useToasts();

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
            style={{
              pointerEvents: "auto",
              background: "#FFF",
              padding: "12px 18px",
              borderRadius: "10px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 280,
              maxWidth: 400,
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              {t.type === "success" && <CheckCircle2 size={18} color="#10B981" />}
              {t.type === "error" && <XCircle size={18} color="#EF4444" />}
              {t.type === "warning" && <AlertCircle size={18} color="#F59E0B" />}
              {t.type === "info" && <Info size={18} color={GOLD} />}
            </div>

            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: "#333",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {t.message}
              </p>
            </div>

            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "#AAA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
