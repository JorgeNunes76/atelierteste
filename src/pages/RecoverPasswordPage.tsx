import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

import { GOLD, CHARCOAL, CREAM } from "../lib/tokens";

export function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao enviar o pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <main style={{ maxWidth: 420, width: "100%" }}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="request"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ background: "#FFF", padding: "48px 40px", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.02)" }}
            >
              <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#9A8E7E", textDecoration: "none", fontSize: "0.8rem", marginBottom: "32px" }}>
                <ArrowLeft size={16} /> Voltar ao Login
              </Link>

              <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "2rem", color: CHARCOAL, marginBottom: "12px", fontWeight: 400 }}>
                Recuperar Acesso
              </h1>
              <p style={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "32px" }}>
                Insira o seu e-mail e enviaremos um link seguro para definir uma nova palavra-passe.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: GOLD, marginBottom: "8px" }}>
                    E-mail da Conta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@exemplo.com"
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: "#F8F9FA",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      color: CHARCOAL,
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {error && <p style={{ color: "#B91C1C", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: loading ? "#CCC" : CHARCOAL,
                    color: "#FFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    cursor: loading ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Enviar Link Seguro"}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ background: "#FFF", padding: "56px 40px", borderRadius: "16px", boxShadow: "0 20px 50px rgba(0,0,0,0.04)", textAlign: "center" }}
            >
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${GOLD}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <CheckCircle size={32} color={GOLD} />
              </div>
              <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "1.8rem", color: CHARCOAL, marginBottom: "12px", fontWeight: 400 }}>
                Link Enviado
              </h2>
              <p style={{ color: "#64748B", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "32px" }}>
                Acabámos de enviar as instruções para <strong style={{ color: CHARCOAL }}>{email}</strong>. Por favor verifique o seu email.
              </p>
              <Link to="/login" style={{ display: "block", padding: "16px", background: CHARCOAL, color: "#FFF", borderRadius: "8px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em" }}>
                Voltar ao Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
