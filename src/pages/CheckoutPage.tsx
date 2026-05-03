import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "../lib/cart";
import { supabase } from "../lib/supabase";
import { useSEO } from "../lib/useSEO";
import { createStripeCheckoutSession } from "../lib/stripe";
import { submitTransferOrder } from "../lib/email";
import { getConfig } from "../lib/db";
import { ArrowLeft, CheckCircle, Loader2, Shield, Lock, ChevronRight, Info } from "lucide-react";
import { GOLD, CREAM, CHARCOAL } from "../lib/tokens";

const DEFAULT_BANK = {
  iban: "Contactar atelier para IBAN",
  titular: "Ana Alexandre",
  mbway: "Contactar atelier para MBWay",
};

// ── Stripe test card hint ──────────────────────────────────────────────────────
const IS_DEV = import.meta.env.DEV;

export function CheckoutPage() {
  useSEO({ title: "Checkout — Ana Alexandre", url: "/checkout" });

  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ 
    nome: "", 
    email: "", 
    telefone: "", 
    nif: "", 
    morada: "", 
    codigoPostal: "", 
    cidade: "",
    notas: "" 
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK);
  const submitLockRef = useRef(false);
  const submitAbortRef = useRef<AbortController | null>(null);

  // Pre-fill from session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (!u) return;
      setForm(prev => ({
        ...prev,
        email: u.email ?? prev.email,
        nome: u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? prev.nome,
      }));
    });
  }, []);

  useEffect(() => {
    return () => {
      submitAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBankDetails() {
      try {
        const [ibanRaw, titularRaw, mbwayRaw] = await Promise.all([
          getConfig("bank_iban"),
          getConfig("bank_titular"),
          getConfig("bank_mbway"),
        ]);

        if (cancelled) return;

        const normalize = (value: string | null, fallback: string, maxLength = 120) => {
          if (!value) return fallback;
          const safe = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
          return safe ? safe.slice(0, maxLength) : fallback;
        };

        setBankDetails({
          iban: normalize(ibanRaw, DEFAULT_BANK.iban),
          titular: normalize(titularRaw, DEFAULT_BANK.titular),
          mbway: normalize(mbwayRaw, DEFAULT_BANK.mbway),
        });
      } catch (cfgError) {
        if (!cancelled && import.meta.env.DEV) {
          console.warn("Falha ao carregar dados bancários de config_site:", cfgError);
        }
      }
    }

    void loadBankDetails();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.85rem", color: "#999", marginBottom: 24 }}>O teu carrinho está vazio.</p>
          <Link to="/galeria" style={{ color: GOLD, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>← Ver Galeria</Link>
        </div>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    submitAbortRef.current?.abort();
    submitAbortRef.current = new AbortController();
    
    // Safety check for NaN prices
    if (isNaN(totalPrice) || totalPrice <= 0) {
      setError("Ocorreu um erro no cálculo do preço. Por favor, verifica o teu carrinho.");
      submitLockRef.current = false;
      setSending(false);
      return;
    }

    setError("");
    setSending(true);

    try {
      const { data: obrasAtuais } = await supabase
        .from("obras").select("id, titulo, estado").in("id", items.map(i => i.id));

      const indisponiveis = (obrasAtuais ?? []).filter(o => o.estado !== "disponivel");
      const idsEncontrados = (obrasAtuais ?? []).map(o => o.id);
      const faltam = items.filter(i => !idsEncontrados.includes(i.id));
      if (indisponiveis.length > 0 || faltam.length > 0) {
        submitLockRef.current = false;
      }

      if (indisponiveis.length > 0) { setError(`"${indisponiveis[0].titulo}" já não está disponível.`); setSending(false); return; }
      if (faltam.length > 0) { setError(`"${faltam[0].titulo}" já não se encontra na galeria.`); setSending(false); return; }

      if (paymentMethod === "card") {
        await createStripeCheckoutSession(items.map(i => i.id), { 
          email: form.email, 
          nome: form.nome, 
          telefone: form.telefone, 
          nif: form.nif,
          morada: `${form.morada}, ${form.codigoPostal} ${form.cidade}`,
          notas: form.notas
        }, { signal: submitAbortRef.current.signal });
        return;
      }

      await submitTransferOrder({
        itemIds:          items.map(i => i.id),
        customerEmail:    form.email,
        customerName:     form.nome,
        customerTelefone: form.telefone || undefined,
        customerMorada:   `${form.morada}, ${form.codigoPostal} ${form.cidade}`,
        nif:              form.nif  || undefined,
        notas:            form.notas || undefined,
      }, { signal: submitAbortRef.current.signal });

      clearCart();
      navigate("/sucesso?transferencia=true");
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string; name?: string };
      setError(e.name === "AbortError" ? "Pedido interrompido. Tenta novamente." : (e.message || "Erro ao processar o pedido. Tenta novamente."));
      submitLockRef.current = false;
      setSending(false);
    }
  }

  const canAdvance = form.email && form.morada && form.codigoPostal && form.cidade;

  return (
    <div style={{ minHeight: "100vh", background: "#F9F8F6" }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/carrinho" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>
            <ArrowLeft size={14} /> Carrinho
          </Link>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", letterSpacing: "0.08em", color: CHARCOAL }}>
            Ana Alexandre
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.65rem", color: "#aaa" }}>
            <Lock size={11} /> Pagamento seguro
          </div>
        </div>
      </header>

      {/* ── Progress ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px" }}>
          <Steps current={step} />
        </div>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(24px,5vw,48px) 24px 80px" }}>
        <div className="flex flex-col lg:flex-row items-start" style={{ gap: 32 }}>

          {/* ── Form Column ─────────────────────────────────────────────────── */}
          <div style={{ flex: "1 1 0", minWidth: 0 }}>
            <form onSubmit={handleSubmit} aria-busy={sending}>
              <AnimatePresence mode="wait">

                {/* Step 1 — Entrega */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                    <FormCard title="Informação de Entrega">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <FloatingInput label="Nome completo" name="nome" value={form.nome} onChange={handleChange} autoComplete="name" style={{ gridColumn: "1 / -1" }} />
                        <FloatingInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" style={{ gridColumn: "1 / -1" }} />
                        <FloatingInput label="Telefone / MBWay" name="telefone" type="tel" value={form.telefone} onChange={handleChange} autoComplete="tel" />
                        <FloatingInput label="NIF (Opcional)" name="nif" value={form.nif} onChange={handleChange} maxLength={9} />
                        
                        <div style={{ gridColumn: "1 / -1", height: 1, background: "rgba(0,0,0,0.06)", margin: "4px 0" }} />
                        
                        <FloatingInput label="Morada" name="morada" value={form.morada} onChange={handleChange} required autoComplete="street-address" style={{ gridColumn: "1 / -1" }} />
                        <FloatingInput label="Código Postal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} required autoComplete="postal-code" placeholder="0000-000" />
                        <FloatingInput label="Cidade" name="cidade" value={form.cidade} onChange={handleChange} required autoComplete="address-level2" />
                        
                        <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                          <p style={{ fontSize: "0.65rem", color: "#aaa", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Notas de Entrega (Opcional)</p>
                          <textarea 
                            name="notas" 
                            value={form.notas} 
                            onChange={(e: any) => setForm(prev => ({ ...prev, notas: e.target.value }))}
                            placeholder="Ex: Deixar na portaria, campainha não funciona..."
                            style={{ 
                              width: "100%", padding: "12px 14px", borderRadius: 8, 
                              border: "1.5px solid rgba(0,0,0,0.1)", background: "#fafaf8",
                              fontSize: "0.88rem", fontFamily: "inherit", minHeight: 80, resize: "vertical",
                              outline: "none"
                            }}
                          />
                        </div>
                      </div>
                    </FormCard>

                    <button
                      type="submit"
                      disabled={!canAdvance}
                      style={{
                        width: "100%", marginTop: 16, padding: "18px 24px",
                        background: canAdvance ? CHARCOAL : "#e5e5e5",
                        color: canAdvance ? "#fff" : "#aaa",
                        border: "none", borderRadius: 10,
                        fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
                        cursor: canAdvance ? "pointer" : "not-allowed",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        transition: "background 0.2s",
                      }}
                    >
                      Continuar para Pagamento <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* Step 2 — Pagamento */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.25 }}>

                    {/* Resumo da morada (colapsado) */}
                    <div
                      onClick={() => setStep(1)}
                      style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                    >
                      <div>
                        <p style={{ fontSize: "0.68rem", color: "#aaa", margin: "0 0 2px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Entrega</p>
                        <p style={{ fontSize: "0.83rem", color: CHARCOAL, margin: 0 }}>{form.nome} · {form.morada}, {form.codigoPostal} {form.cidade}</p>
                      </div>
                      <span style={{ fontSize: "0.7rem", color: GOLD, letterSpacing: "0.06em" }}>Editar</span>
                    </div>

                    <FormCard title="Método de Pagamento">
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <PaymentOption
                          id="card" selected={paymentMethod === "card"}
                          onClick={() => setPaymentMethod("card")}
                          title="Cartão de Crédito / Débito"
                          badge={<CardLogos />}
                          desc="Processamento seguro via Stripe · Visa, Mastercard, Apple Pay, Google Pay"
                        />
                        <PaymentOption
                          id="transfer" selected={paymentMethod === "transfer"}
                          onClick={() => setPaymentMethod("transfer")}
                          title="Transferência Bancária / MBWay"
                          desc="Confirme o pedido e receberá os dados por email"
                        />
                      </div>

                      {/* Bank details reveal */}
                      <AnimatePresence>
                        {paymentMethod === "transfer" && (
                          <motion.div
                            key="bank"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ marginTop: 16, background: `${GOLD}08`, border: `1px solid ${GOLD}25`, borderRadius: 10, padding: "20px 24px" }}>
                              <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 600, margin: "0 0 14px" }}>Dados Bancários</p>
                              <div style={{ display: "grid", gap: 12 }}>
                                {[["IBAN", bankDetails.iban], ["Titular", bankDetails.titular], ["MBWay", bankDetails.mbway]].map(([k, v]) => (
                                  <div key={k} style={{ display: "flex", gap: 12, fontSize: "0.82rem", alignItems: "center" }}>
                                    <span style={{ color: "#aaa", width: 60, flexShrink: 0 }}>{k}</span>
                                    <span style={{ color: CHARCOAL, fontWeight: 500, letterSpacing: k === "IBAN" ? "0.05em" : undefined, flex: 1 }}>{v}</span>
                                    {v && !/contactar|não configurado|nao configurado/i.test(v) && (
                                      <button 
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(v); alert("Copiado!"); }}
                                        style={{ background: "none", border: "none", color: GOLD, fontSize: "0.65rem", cursor: "pointer", padding: "4px", fontWeight: 600 }}
                                      >
                                        COPIAR
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p style={{ fontSize: "0.7rem", color: "#666", margin: "14px 0 0", lineHeight: 1.6, background: "#fff", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 6 }}>
                                💡 <strong>Instruções:</strong> No campo "Referência" da transferência, coloque o seu nome: <strong>{form.nome || "Não preenchido"}</strong>.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Stripe test hint */}
                      {IS_DEV && paymentMethod === "card" && (
                        <div style={{ marginTop: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10 }}>
                          <Info size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
                          <p style={{ fontSize: "0.72rem", color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                            <strong>Modo Teste:</strong> cartão <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 3, fontFamily: "monospace" }}>4242 4242 4242 4242</code> · data futura · CVC qualquer
                          </p>
                        </div>
                      )}
                    </FormCard>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          role="alert"
                          aria-live="polite"
                          style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "14px 18px", marginTop: 16, fontSize: "0.82rem", color: "#dc2626", lineHeight: 1.5 }}>
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={sending}
                      aria-disabled={sending}
                      whileTap={sending ? {} : { scale: 0.985 }}
                      style={{
                        width: "100%", marginTop: 16, padding: "19px 24px",
                        background: sending ? "#e5e5e5" : `linear-gradient(135deg, #d4b87a 0%, ${GOLD} 50%, #b8944f 100%)`,
                        color: sending ? "#aaa" : "#fff",
                        border: "none", borderRadius: 10,
                        fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
                        cursor: sending ? "not-allowed" : "pointer",
                        boxShadow: sending ? "none" : `0 8px 28px ${GOLD}45`,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        transition: "background 0.2s, box-shadow 0.2s",
                      }}
                    >
                      {sending
                        ? <><Loader2 size={16} className="animate-spin" /> A processar...</>
                        : <><CheckCircle size={16} /> {paymentMethod === "card" ? "Pagar com Cartão" : "Confirmar Pedido"}</>
                      }
                    </motion.button>

                    <p style={{ textAlign: "center", fontSize: "0.68rem", color: "#bbb", margin: "16px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Shield size={11} /> Encriptação SSL · Pagamento 100% seguro
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>

          {/* ── Order Summary Column ─────────────────────────────────────────── */}
          <div className="lg:sticky" style={{ flex: "0 0 360px", width: "100%", top: 80 }}>
            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", margin: 0 }}>
                  O Teu Pedido · {items.length} {items.length === 1 ? "obra" : "obras"}
                </p>
              </div>

              {/* Items */}
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "#f0ece6", flexShrink: 0, position: "relative" }}>
                      {item.imagem_url
                        ? <img src={item.imagem_url} alt={item.titulo} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: `${GOLD}20` }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.85rem", color: CHARCOAL, margin: "0 0 3px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titulo}</p>
                      <p style={{ fontSize: "0.7rem", color: "#aaa", margin: "0 0 6px" }}>{item.tecnica}</p>
                      <p style={{ fontSize: "0.82rem", color: GOLD, fontWeight: 600, margin: 0 }}>€{item.preco.toLocaleString("pt-PT")}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Subtotal</span>
                  <span style={{ fontSize: "0.8rem", color: "#555" }}>€{totalPrice.toLocaleString("pt-PT")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Envio</span>
                  <span style={{ fontSize: "0.8rem", color: "#22c55e", fontWeight: 500 }}>Gratuito</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 4, alignItems: "baseline" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: CHARCOAL }}>Total</span>
                  <span style={{ fontSize: "1.6rem", fontWeight: 700, color: CHARCOAL, letterSpacing: "-0.03em" }}>
                    €{totalPrice.toLocaleString("pt-PT")}
                  </span>
                </div>
              </div>

              {/* Trust */}
              <div style={{ padding: "14px 24px", background: "#fafaf8", borderTop: "1px solid rgba(0,0,0,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["🔒", "Pagamento Seguro"], ["🚚", "Envio Gratuito"], ["↩️", "Devolução 14 dias"], ["✅", "Obra Certificada"]].map(([icon, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: "0.9rem" }}>{icon}</span>
                    <span style={{ fontSize: "0.65rem", color: "#888", lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Steps({ current }: { current: number }) {
  const steps = ["Carrinho", "Entrega", "Pagamento"];
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 0" }}>
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? GOLD : active ? CHARCOAL : "transparent",
                border: `2px solid ${done || active ? "transparent" : "#ddd"}`,
                transition: "all 0.3s",
              }}>
                {done
                  ? <CheckCircle size={14} color="#fff" />
                  : <span style={{ fontSize: "0.65rem", color: active ? "#fff" : "#bbb", fontWeight: 600 }}>{idx}</span>
                }
              </div>
              <span style={{ fontSize: "0.72rem", letterSpacing: "0.06em", color: active ? CHARCOAL : done ? GOLD : "#bbb", fontWeight: active ? 600 : 400, transition: "color 0.3s" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: current > idx + 1 ? GOLD : "#e5e5e5", margin: "0 12px", transition: "background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: CHARCOAL, margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: "24px" }}>{children}</div>
    </div>
  );
}

function FloatingInput({ label, name, value, onChange, type = "text", required, autoComplete, placeholder, style }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; autoComplete?: string; placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const floating = focused || !!value;

  return (
    <div style={{ position: "relative", ...style }} onClick={() => inputRef.current?.focus()}>
      <label style={{
        position: "absolute", left: 14, top: floating ? 8 : "50%",
        transform: floating ? "none" : "translateY(-50%)",
        fontSize: floating ? "0.6rem" : "0.83rem",
        color: focused ? GOLD : "#aaa",
        letterSpacing: floating ? "0.08em" : undefined,
        textTransform: floating ? "uppercase" : undefined,
        transition: "all 0.18s ease", pointerEvents: "none", zIndex: 1,
      }}>
        {label}{required && " *"}
      </label>
      <input
        ref={inputRef}
        name={name} type={type} value={value} onChange={onChange}
        required={required} autoComplete={autoComplete} placeholder={focused ? placeholder : ""}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: floating ? "22px 14px 8px" : "14px",
          border: `1.5px solid ${focused ? GOLD : "rgba(0,0,0,0.1)"}`,
          borderRadius: 8, fontSize: "0.88rem", color: CHARCOAL,
          background: "#fafaf8", outline: "none", boxSizing: "border-box",
          fontFamily: "inherit", transition: "border-color 0.18s, padding 0.18s",
        }}
      />
    </div>
  );
}

function PaymentOption({ selected, onClick, title, badge, desc }: {
  selected: boolean; onClick: () => void;
  title: string; badge?: React.ReactNode; desc: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? GOLD : "rgba(0,0,0,0.08)"}`,
        borderRadius: 10, padding: "16px 18px", cursor: "pointer",
        background: selected ? `${GOLD}05` : "#fff",
        transition: "border-color 0.2s, background 0.2s",
        display: "flex", gap: 14, alignItems: "flex-start",
      }}
    >
      {/* Radio */}
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
        border: `2px solid ${selected ? GOLD : "#ccc"}`,
        background: selected ? GOLD : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, color: selected ? CHARCOAL : "#666", margin: 0, transition: "color 0.2s" }}>{title}</p>
          {badge}
        </div>
        <p style={{ fontSize: "0.72rem", color: "#aaa", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function CardLogos() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {/* Visa */}
      <svg width="34" height="22" viewBox="0 0 34 22" fill="none" style={{ borderRadius: 3, border: "1px solid #e5e5e5" }}>
        <rect width="34" height="22" fill="#1A1F71" rx="3"/>
        <text x="5" y="15" fill="#fff" fontSize="9" fontWeight="bold" fontFamily="Arial">VISA</text>
      </svg>
      {/* Mastercard */}
      <svg width="34" height="22" viewBox="0 0 34 22" fill="none" style={{ borderRadius: 3, border: "1px solid #e5e5e5" }}>
        <rect width="34" height="22" fill="#fff" rx="3"/>
        <circle cx="13" cy="11" r="7" fill="#EB001B"/>
        <circle cx="21" cy="11" r="7" fill="#F79E1B"/>
        <path d="M17 5.5a7 7 0 010 11 7 7 0 010-11z" fill="#FF5F00"/>
      </svg>
      {/* Apple Pay */}
      <div style={{ background: "#000", borderRadius: 3, padding: "3px 6px", fontSize: "0.55rem", color: "#fff", fontWeight: 600, letterSpacing: "0.02em", border: "1px solid #000" }}>
        ⌘ Pay
      </div>
    </div>
  );
}
