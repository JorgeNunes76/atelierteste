import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useCart } from "../lib/cart";
import { getConfig } from "../lib/db";

import { motion } from "motion/react";
import { GOLD, CREAM, CHARCOAL, SLATE } from "../lib/tokens";

export function SucessoPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const isPagamento = searchParams.has("session_id");
  const isTransferencia = searchParams.has("transferencia");

  useEffect(() => {
    if (isPagamento || isTransferencia) {
      clearCart();
      // Em produção, podes disparar um canvas-confetti aqui
    }
  }, []);

  const titulo = isPagamento
    ? "Pagamento confirmado!"
    : isTransferencia
    ? "Pedido recebido!"
    : "Mensagem enviada com sucesso";

  const subtitulo = isPagamento
    ? "Obrigada por apoiares a arte original. Receberás um recibo por email em breve."
    : isTransferencia
    ? "Para garantires a exclusividade desta obra, por favor segue as instruções abaixo."
    : "Recebemos o teu contacto. Responderei o mais brevemente possível.";

  const backTo = isTransferencia || isPagamento ? "/galeria" : "/contactos";
  const backLabel = isTransferencia || isPagamento ? "Explorar mais obras" : "Voltar aos contactos";
  const [bankIban, setBankIban] = useState("Contactar atelier para IBAN");

  useEffect(() => {
    let cancelled = false;
    async function loadBankIban() {
      try {
        const value = await getConfig("bank_iban");
        if (cancelled) return;
        const safe = value?.replace(/[\u0000-\u001F\u007F]/g, "").trim();
        if (safe) setBankIban(safe.slice(0, 120));
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("Falha ao carregar IBAN de config_site:", err);
        }
      }
    }
    void loadBankIban();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: CREAM, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: 640, width: "100%", textAlign: "center" }}
      >
        
        {/* Success Icon with Glow */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.08) 100%)",
          border: `2px solid ${GOLD}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: `0 20px 40px rgba(201,169,110,0.12)`,
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
          >
            <CheckCircle size={40} color={GOLD} strokeWidth={1.2} />
          </motion.div>
        </div>

        <h1 style={{
          fontFamily: "'Bodoni Moda', 'Playfair Display', serif",
          fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
          fontWeight: 400, color: CHARCOAL,
          margin: "0 0 16px", lineHeight: 1.2,
          letterSpacing: "-0.02em"
        }}>
          {titulo}
        </h1>

        <p style={{ fontSize: "1.1rem", color: SLATE, lineHeight: 1.6, margin: "0 0 40px", maxWidth: 480, marginInline: "auto" }}>
          {subtitulo}
        </p>

        {/* Dynamic Payment Card for Transferência */}
        {isTransferencia && (
          <div style={{
            background: "#FFF",
            border: "1px solid rgba(201,169,110,0.25)",
            padding: "32px",
            borderRadius: "16px",
            marginBottom: "40px",
            textAlign: "left",
            boxShadow: "0 15px 35px rgba(0,0,0,0.03)"
          }}>
            <h3 style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD, marginBottom: "20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 14, height: 1, background: GOLD }}></span>
              Instruções de Pagamento
            </h3>
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "#999", letterSpacing: "0.05em" }}>IBAN para depósito</label>
              <div style={{
                marginTop: "4px",
                padding: "14px 18px",
                background: "#FAF8F5",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "1rem",
                color: CHARCOAL,
                border: "1px dashed rgba(201,169,110,0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {bankIban}
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={16} color={GOLD} />
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: CHARCOAL, margin: "0 0 4px", fontWeight: 500 }}>Enviar comprovativo</p>
                <p style={{ fontSize: "0.8rem", color: SLATE, margin: 0 }}>
                  Por favor envia o comprovativo para <strong style={{ color: CHARCOAL }}>atelier.anaalexandre@gmail.com</strong> indicando o teu nome.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global actions */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
          <Link to={backTo} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 32px", borderRadius: "8px",
            border: "1px solid #1a1a1a",
            color: "#1a1a1a", fontSize: "0.75rem", fontWeight: 600,
            textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1a1a1a", e.currentTarget.style.color = "#fff")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "#1a1a1a")}
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "16px 32px", borderRadius: "8px",
            background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)", 
            color: "#FFF", fontSize: "0.75rem", fontWeight: 600, 
            textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.15em",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
          }}>
            Ir para a Homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
