import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signIn } from "../lib/auth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoImg from "figma:asset/9e49ce9bc26e1e634dc598fea63b188cbb9a363d.png";

import { GOLD, CHARCOAL } from "../lib/tokens";
const STUDIO_IMG =
  "https://images.unsplash.com/photo-1580725396988-52d490f9d46a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBzdHVkaW8lMjBwYWludGluZyUyMGNhbnZhcyUyMGF0ZWxpZXIlMjBsaWdodHxlbnwxfHx8fDE3NzM1MTIzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080";

/* ── Floating label field ─────────────────────────────────── */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  suffix?: React.ReactNode;
}

function Field({ label, type = "text", value, onChange, required, suffix }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative w-full">
      <motion.label
        animate={{
          y: active ? -18 : 0,
          scale: active ? 0.75 : 1,
          color: active ? GOLD : "#BBAC98",
        }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0.1, 1] }}
        className="absolute pointer-events-none select-none"
        style={{
          top: 22,
          left: 0,
          fontSize: "0.72rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          transformOrigin: "left center",
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </motion.label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${active ? GOLD : "rgba(26,26,26,0.12)"}`,
          outline: "none",
          padding: "28px 0 12px",
          fontSize: "0.95rem",
          color: CHARCOAL,
          fontFamily: "var(--font-sans)",
          paddingRight: suffix ? 36 : 0,
          transition: "border-color 0.3s",
          display: "block",
          boxSizing: "border-box",
        }}
      />

      {/* Animated gold underline */}
      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${GOLD}, #E8C98A)`,
          transformOrigin: "left",
        }}
      />

      {suffix && (
        <div className="absolute right-0 bottom-[10px]">{suffix}</div>
      )}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get("redirect") ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(redirect, { replace: true });
    } catch {
      setError("Email ou palavra-passe incorretos.");
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "var(--font-sans)",
        background: "#fff",
      }}
    >
      {/* ══ LEFT — editorial image panel ══ */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between overflow-hidden"
        style={{ background: "#111" }}
      >
        {/* Background image */}
        <img
          src={STUDIO_IMG}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.45,
            filter: "saturate(0.6)",
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(15,12,10,0.55) 0%, rgba(26,22,18,0.7) 55%, rgba(12,10,8,0.88) 100%)",
          }}
        />

        {/* Ghost logo watermark */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-8%",
            right: "-12%",
            width: "70%",
            opacity: 0.06,
            pointerEvents: "none",
            userSelect: "none",
            filter: "brightness(2)",
          }}
        />

        {/* Decorative corner lines */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 40,
            width: 48,
            height: 48,
            borderTop: `1px solid rgba(201,169,110,0.35)`,
            borderLeft: `1px solid rgba(201,169,110,0.35)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 40,
            width: 48,
            height: 48,
            borderBottom: `1px solid rgba(201,169,110,0.35)`,
            borderRight: `1px solid rgba(201,169,110,0.35)`,
          }}
        />

        {/* Top — logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ position: "relative", zIndex: 2, padding: "48px 52px" }}
        >
          <img
            src={logoImg}
            alt="Atelier Ana Alexandre"
            style={{ width: 180, height: "auto", opacity: 0.92 }}
          />
        </motion.div>

        {/* Bottom — quote block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            position: "relative",
            zIndex: 2,
            padding: "52px",
          }}
        >
          {/* Gold rule */}
          <div
            style={{
              width: 36,
              height: 1,
              background: GOLD,
              marginBottom: 24,
            }}
          />

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.3rem, 2vw, 1.75rem)",
              color: "#fff",
              lineHeight: 1.45,
              fontStyle: "italic",
              marginBottom: 20,
              letterSpacing: "-0.01em",
            }}
          >
            &ldquo;A pintura como estrutura,<br />
            <span style={{ color: GOLD }}>linguagem</span> e reflexão.&rdquo;
          </p>

          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Ana Alexandre · Tomar, Portugal
          </p>
        </motion.div>
      </div>

      {/* ══ RIGHT — form panel ══ */}
      <div
        className="w-full lg:w-[45%] flex flex-col justify-center relative overflow-hidden"
        style={{ background: "#FFFFFF", padding: "clamp(40px,8vw,80px) clamp(28px,7vw,72px)" }}
      >
        {/* Ghost logo — mobile only */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          className="lg:hidden"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(110vw, 700px)",
            opacity: 0.07,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 400, width: "100%", margin: "0 auto" }}>

          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex lg:hidden justify-center mb-10"
          >
            <img
              src={logoImg}
              alt="Atelier Ana Alexandre"
              style={{ width: "min(72vw, 280px)", height: "auto" }}
            />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: 44 }}
          >
            <p
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: 14,
              }}
            >
              Área Reservada
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: CHARCOAL,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 12,
              }}
            >
              Bem-vindo<br />
              <span style={{ fontStyle: "italic", color: "#555" }}>de volta.</span>
            </h1>
            <p
              style={{
                fontSize: "0.87rem",
                color: "#9A8E7E",
                lineHeight: 1.65,
              }}
            >
              Aceda à sua conta para gerir coleções,<br className="hidden sm:block" /> acompanhar encomendas e orientação.
            </p>
          </motion.div>

          {/* Thin gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${GOLD}80, transparent)`,
              marginBottom: 40,
              transformOrigin: "left",
            }}
          />

          {/* Form */}
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                style={{ textAlign: "center", padding: "32px 0" }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    border: `1px solid rgba(201,169,110,0.4)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: CHARCOAL, marginBottom: 8 }}>
                  Autenticação bem-sucedida
                </p>
                <p style={{ fontSize: "0.85rem", color: "#aaa" }}>A redirecionar…</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 28 }}
              >
                <Field
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                />

                <Field
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  required
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#BBA888",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={15} strokeWidth={1.4} />
                      ) : (
                        <Eye size={15} strokeWidth={1.4} />
                      )}
                    </button>
                  }
                />

                {/* Forgot */}
                <div style={{ textAlign: "right", marginTop: -12 }}>
                  <Link
                    to="/recuperar-password"
                    style={{
                      fontSize: "0.72rem",
                      color: "#BBB0A0",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      borderBottom: "1px solid transparent",
                      paddingBottom: 1,
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = GOLD;
                      e.currentTarget.style.borderBottomColor = GOLD;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#BBB0A0";
                      e.currentTarget.style.borderBottomColor = "transparent";
                    }}
                  >
                    Esqueci a password
                  </Link>
                </div>

                {/* Error */}
                {error && (
                  <p style={{ fontSize: "0.8rem", color: "#B91C1C", textAlign: "center", margin: "-8px 0" }}>
                    {error}
                  </p>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    padding: "18px 28px",
                    background: submitting
                      ? "#CCC"
                      : `linear-gradient(115deg, #B8884A 0%, ${GOLD} 50%, #D4B07A 100%)`,
                    border: "none",
                    cursor: submitting ? "default" : "pointer",
                    color: "#FFF",
                    fontSize: "0.7rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: submitting
                      ? "none"
                      : `0 6px 28px rgba(201,169,110,0.38)`,
                    transition: "background 0.3s, box-shadow 0.3s",
                  }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "1.5px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                        }}
                      />
                      A autenticar…
                    </>
                  ) : (
                    <>
                      Entrar na conta
                      <ArrowRight size={13} strokeWidth={1.5} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              margin: "36px 0",
            }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize: "0.65rem", color: "#CCC", letterSpacing: "0.1em", textTransform: "uppercase" }}>ou</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(0,0,0,0.08)" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#9A8E7E" }}>
            Ainda não tem conta?{" "}
            <Link
              to="/register"
              style={{
                color: CHARCOAL,
                textDecoration: "none",
                borderBottom: `1px solid ${GOLD}`,
                paddingBottom: 1,
                fontSize: "0.85rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.color = CHARCOAL)}
            >
              Criar conta
            </Link>
          </p>

          {/* Footer */}
          <div style={{ marginTop: 56, textAlign: "center" }}>
            <div
              style={{
                width: 24,
                height: "0.5px",
                background: "rgba(0,0,0,0.12)",
                margin: "0 auto 20px",
              }}
            />
            <p
              style={{
                fontSize: "0.55rem",
                color: "#CCC",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              © 2026 Atelier Ana Alexandre
            </p>
            <p
              style={{
                fontSize: "0.48rem",
                color: "#DDD",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
              }}
            >
              by HARTEG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
