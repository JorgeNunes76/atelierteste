import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updatePassword } from "../lib/auth";
import { motion } from "motion/react";
import { Lock, CheckCircle, Loader2 } from "lucide-react";

import { GOLD, CHARCOAL, CREAM } from "../lib/tokens";

export function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePassword(password);
      setSubmitted(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <main style={{ maxWidth: 420, width: "100%" }}>
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ background: "#FFF", padding: "48px 40px", borderRadius: "20px", boxShadow: "0 25px 50px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.03)" }}
          >
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${GOLD}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <Lock size={24} color={GOLD} />
            </div>

            <h1 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "1.85rem", color: CHARCOAL, textAlign: "center", marginBottom: "12px", fontWeight: 400 }}>
              Nova Palavra-passe
            </h1>
            <p style={{ color: "#64748B", fontSize: "0.9rem", textAlign: "center", marginBottom: "40px", lineHeight: 1.6 }}>
              Escolha uma chave segura para proteger o seu acesso ao Atelier.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: GOLD, marginBottom: "8px" }}>
                  Nova Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: GOLD, marginBottom: "8px" }}>
                  Confirmar Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {error && <p style={{ color: "#B91C1C", fontSize: "0.8rem", textAlign: "center", margin: 0 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "18px",
                  background: loading ? "#CCC" : CHARCOAL,
                  color: "#FFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  cursor: loading ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  marginTop: "8px"
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Atualizar & Entrar"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: "#FFF", padding: "56px 40px", borderRadius: "20px", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.06)" }}
          >
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", border: "2px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <CheckCircle size={32} color="#16A34A" />
            </div>
            <h2 style={{ fontFamily: "'Bodoni Moda', serif", fontSize: "1.8rem", color: CHARCOAL, marginBottom: "12px", fontWeight: 400 }}>
              Atualizada!
            </h2>
            <p style={{ color: "#64748B", fontSize: "1rem", lineHeight: 1.6, marginBottom: "32px" }}>
              A sua palavra-passe foi alterada com sucesso. A redirecionar para o login…
            </p>
            <div style={{ width: 40, height: 2, background: GOLD, margin: "0 auto" }} />
          </motion.div>
        )}
      </main>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "16px",
  background: "#F8F9FA",
  border: "1px solid #E2E8F0",
  borderRadius: "8px",
  fontSize: "1rem",
  color: CHARCOAL,
  outline: "none",
  boxSizing: "border-box" as const
};
