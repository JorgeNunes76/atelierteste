import { useState } from "react";
import { Link } from "react-router-dom";
import { signUp } from "../lib/auth";
import { Eye, EyeOff, ArrowRight, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoImg from "figma:asset/9e49ce9bc26e1e634dc598fea63b188cbb9a363d.png";

import { GOLD, CHARCOAL } from "../lib/tokens";

const GALLERY_IMG =
  "https://images.unsplash.com/photo-1764922168474-8048361bc764?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBwYWludGluZyUyMGV4aGliaXRpb24lMjBnYWxsZXJ5JTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3NzM1MTI4Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080";

/* ── Password strength ───────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Fraca", color: "#E05C5C" };
  if (score <= 3) return { score, label: "Razoável", color: "#E8A84A" };
  return { score, label: "Forte", color: "#5DBE7A" };
}

/* ── Floating label field ────────────────────────────────── */
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  suffix?: React.ReactNode;
  hint?: React.ReactNode;
  borderColorOverride?: string;
}

function Field({ label, type = "text", value, onChange, required, suffix, hint, borderColorOverride }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const borderColor = borderColorOverride ?? (focused ? GOLD : "rgba(26,26,26,0.12)");

  return (
    <div className="relative w-full">
      <motion.label
        animate={{
          y: active ? -18 : 0,
          scale: active ? 0.75 : 1,
          color: active ? (borderColorOverride && !focused ? borderColorOverride : GOLD) : "#BBAC98",
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
          borderBottom: `1px solid ${borderColor}`,
          outline: "none",
          padding: "28px 0 12px",
          paddingRight: suffix ? 36 : 0,
          fontSize: "0.95rem",
          color: CHARCOAL,
          fontFamily: "var(--font-sans)",
          display: "block",
          boxSizing: "border-box",
          transition: "border-color 0.3s",
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
          background: `linear-gradient(90deg, ${borderColorOverride ?? GOLD}, #E8C98A)`,
          transformOrigin: "left",
        }}
      />

      {suffix && (
        <div className="absolute right-0 bottom-[10px]">{suffix}</div>
      )}

      {hint && (
        <div style={{ marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────���────────────────── */
export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });

  const set = (k: keyof typeof values) => (v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const strength = getStrength(values.password);
  const passwordsMatch = values.password.length > 0 && values.confirm.length > 0 && values.password === values.confirm;
  const passwordMismatch = values.confirm.length > 0 && values.password !== values.confirm;

  const confirmBorderColor = passwordMismatch
    ? "#E05C5C"
    : passwordsMatch
    ? "#5DBE7A"
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch) return;
    setSubmitting(true);
    setError(null);
    try {
      await signUp(values.email, values.password, values.name);
      setSubmitted(true);
    } catch {
      setError("Erro ao criar conta. Tenta novamente.");
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
      {/* ══ LEFT — form panel (mirrored from login) ══ */}
      <div
        className="w-full lg:w-[45%] flex flex-col justify-center relative overflow-hidden"
        style={{
          background: "#FFFFFF",
          padding: "clamp(40px,8vw,80px) clamp(28px,7vw,72px)",
        }}
      >
        {/* Ghost logo — mobile + subtle desktop watermark */}
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(110vw, 700px)",
            opacity: 0.06,
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
              Novo Membro
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
              Junte-se<br />
              <span style={{ fontStyle: "italic", color: "#555" }}>ao atelier.</span>
            </h1>
            <p
              style={{
                fontSize: "0.87rem",
                color: "#9A8E7E",
                lineHeight: 1.65,
              }}
            >
              Acesso exclusivo a obras, exposições,<br className="hidden sm:block" /> orientação e eventos privados.
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
                style={{ textAlign: "center", padding: "28px 0" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
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
                  <Check size={20} strokeWidth={1.4} color={GOLD} />
                </motion.div>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: CHARCOAL, marginBottom: 8 }}>
                  Conta criada com sucesso
                </p>
                <p style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: 28 }}>
                  Verifique o seu e-mail para ativar a conta.
                </p>
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: `linear-gradient(115deg, #B8884A 0%, ${GOLD} 50%, #D4B07A 100%)`,
                    padding: "14px 28px",
                    textDecoration: "none",
                  }}
                >
                  Iniciar Sessão <ArrowRight size={12} strokeWidth={1.5} />
                </Link>
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
                {/* Name */}
                <Field
                  label="Nome Completo"
                  value={values.name}
                  onChange={set("name")}
                  required
                />

                {/* Email */}
                <Field
                  label="E-mail"
                  type="email"
                  value={values.email}
                  onChange={set("email")}
                  required
                />

                {/* Password + strength */}
                <Field
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={set("password")}
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
                      {showPassword ? <EyeOff size={15} strokeWidth={1.4} /> : <Eye size={15} strokeWidth={1.4} />}
                    </button>
                  }
                  hint={
                    values.password.length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, display: "flex", gap: 3 }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                              key={i}
                              animate={{
                                background: i <= strength.score ? strength.color : "rgba(0,0,0,0.07)",
                              }}
                              transition={{ duration: 0.3 }}
                              style={{ flex: 1, height: 2, borderRadius: 2 }}
                            />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            letterSpacing: "0.08em",
                            color: strength.color,
                            minWidth: 52,
                            textAlign: "right",
                          }}
                        >
                          {strength.label}
                        </span>
                      </div>
                    ) : null
                  }
                />

                {/* Confirm password */}
                <Field
                  label="Confirmar Password"
                  type={showConfirm ? "text" : "password"}
                  value={values.confirm}
                  onChange={set("confirm")}
                  required
                  borderColorOverride={confirmBorderColor}
                  suffix={
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <AnimatePresence mode="wait">
                        {passwordsMatch && (
                          <motion.div
                            key="ok"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260 }}
                          >
                            <Check size={14} strokeWidth={2} color="#5DBE7A" />
                          </motion.div>
                        )}
                        {passwordMismatch && (
                          <motion.div
                            key="err"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                          >
                            <X size={14} strokeWidth={2} color="#E05C5C" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
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
                        {showConfirm ? <EyeOff size={15} strokeWidth={1.4} /> : <Eye size={15} strokeWidth={1.4} />}
                      </button>
                    </div>
                  }
                  hint={
                    <AnimatePresence>
                      {passwordMismatch && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          style={{ fontSize: "0.68rem", color: "#E05C5C", margin: 0 }}
                        >
                          As passwords não coincidem
                        </motion.p>
                      )}
                    </AnimatePresence>
                  }
                />

                {/* Newsletter toggle */}
                <motion.button
                  type="button"
                  onClick={() => setNewsletter((v) => !v)}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    marginTop: -4,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      flexShrink: 0,
                      marginTop: 2,
                      border: `1.5px solid ${newsletter ? GOLD : "rgba(0,0,0,0.18)"}`,
                      background: newsletter ? GOLD : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    <AnimatePresence>
                      {newsletter && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check size={10} color="#FFF" strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#888",
                      lineHeight: 1.6,
                      userSelect: "none",
                    }}
                  >
                    Quero receber notificações de novas obras, exposições e eventos do atelier.
                  </span>
                </motion.button>

                {/* Terms note */}
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#BBB",
                    lineHeight: 1.6,
                    marginTop: -12,
                  }}
                >
                  Ao criar conta, aceita os{" "}
                  <a
                    href="#"
                    style={{
                      color: "#999",
                      borderBottom: "1px solid rgba(0,0,0,0.15)",
                      paddingBottom: 1,
                      textDecoration: "none",
                    }}
                  >
                    Termos e Condições
                  </a>{" "}
                  e a{" "}
                  <a
                    href="#"
                    style={{
                      color: "#999",
                      borderBottom: "1px solid rgba(0,0,0,0.15)",
                      paddingBottom: 1,
                      textDecoration: "none",
                    }}
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>

                {/* Error */}
                {error && (
                  <p style={{ fontSize: "0.8rem", color: "#B91C1C", textAlign: "center", margin: "-8px 0" }}>
                    {error}
                  </p>
                )}

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={submitting || !!passwordMismatch}
                  whileHover={!passwordMismatch && !submitting ? { y: -1 } : {}}
                  whileTap={!passwordMismatch && !submitting ? { scale: 0.98 } : {}}
                  style={{
                    width: "100%",
                    padding: "18px 28px",
                    background:
                      passwordMismatch
                        ? "#DDD"
                        : submitting
                        ? "#CCC"
                        : `linear-gradient(115deg, #B8884A 0%, ${GOLD} 50%, #D4B07A 100%)`,
                    border: "none",
                    cursor: passwordMismatch || submitting ? "default" : "pointer",
                    color: "#FFF",
                    fontSize: "0.7rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-sans)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow:
                      passwordMismatch || submitting
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
                      A criar conta…
                    </>
                  ) : (
                    <>
                      Criar Conta
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

          {/* Login link */}
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#9A8E7E" }}>
            Já tem conta?{" "}
            <Link
              to="/login"
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
              Iniciar sessão
            </Link>
          </p>

          {/* Footer */}
          <div style={{ marginTop: 56, textAlign: "center" }}>
            <div style={{ width: 24, height: "0.5px", background: "rgba(0,0,0,0.12)", margin: "0 auto 20px" }} />
            <p style={{ fontSize: "0.55rem", color: "#CCC", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
              © 2026 Atelier Ana Alexandre
            </p>
            <p style={{ fontSize: "0.48rem", color: "#DDD", letterSpacing: "0.32em", textTransform: "uppercase" }}>
              by HARTEG
            </p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — editorial image panel (mirrored) ══ */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between overflow-hidden"
        style={{ background: "#0e0c0a" }}
      >
        {/* Background image */}
        <img
          src={GALLERY_IMG}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.4,
            filter: "saturate(0.5)",
          }}
        />

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(200deg, rgba(12,10,8,0.5) 0%, rgba(22,18,14,0.72) 55%, rgba(10,8,6,0.92) 100%)",
          }}
        />

        {/* Decorative corner lines */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 40,
            width: 48,
            height: 48,
            borderTop: `1px solid rgba(201,169,110,0.3)`,
            borderRight: `1px solid rgba(201,169,110,0.3)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 40,
            width: 48,
            height: 48,
            borderBottom: `1px solid rgba(201,169,110,0.3)`,
            borderLeft: `1px solid rgba(201,169,110,0.3)`,
          }}
        />

        {/* Top — logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ position: "relative", zIndex: 2, padding: "48px 52px", display: "flex", justifyContent: "flex-end" }}
        >
          <img
            src={logoImg}
            alt="Atelier Ana Alexandre"
            style={{ width: 180, height: "auto", opacity: 0.9 }}
          />
        </motion.div>

        {/* Bottom — benefits block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ position: "relative", zIndex: 2, padding: "52px" }}
        >
          <div style={{ width: 36, height: 1, background: GOLD, marginBottom: 28 }} />

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.3rem, 2vw, 1.75rem)",
              color: "#fff",
              lineHeight: 1.4,
              marginBottom: 32,
              letterSpacing: "-0.01em",
            }}
          >
            Faça parte de uma<br />
            <span style={{ fontStyle: "italic", color: GOLD }}>comunidade de arte</span><br />
            única em Portugal.
          </p>

          {/* Benefits list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              "Acesso antecipado a novas obras",
              "Convites para exposições e vernissages",
              "Acompanhamento personalizado em orientação",
              "Newsletter exclusiva com bastidores do atelier",
            ].map((benefit) => (
              <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    border: `1px solid rgba(201,169,110,0.35)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={10} strokeWidth={2} color={GOLD} />
                </div>
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
