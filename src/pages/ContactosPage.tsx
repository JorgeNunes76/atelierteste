import { useEffect, useMemo, useRef, useState } from "react";
import { enviarContacto, getConfigAll } from "../lib/db";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, Mail, Phone, Instagram,
  ChevronDown, Check, Clock, ExternalLink,
  ShoppingBag, GraduationCap, Handshake, MessageSquare,
  Send, ArrowDown,
} from "lucide-react";
import { FadeIn } from "../app/components/FadeIn";
import { ImageWithFallback } from "../app/components/ui/ImageWithFallback";
import {
  buildSiteContentFromConfigs,
  getMailToHref,
  getTelephoneHref,
  SITE_CONTENT_DEFAULTS,
  splitAddress,
} from "../lib/siteContent";

// ── Palette ──────────────────────────────────────────────────
const GOLD = "#C9A96E";
const GOLD_D = "#a87848";
const SEPIA = "#8B6E4E";
const WARM = "#f2ede8";
const CREAM = "#faf7f2";

// ── Images ───────────────────────────────────────────────────
const IMG_TOMAR = "https://images.unsplash.com/photo-1762295370919-604e7def916e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_STUDIO = "https://images.unsplash.com/photo-1534868297432-500841db8da1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBvcGVuJTIwYXRlbGllciUyMHN0dWRpbyUyMHBhaW50aW5nJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MzUxMjIyOXww&ixlib=rb-4.1.0&q=80&w=1080";

// ── Data ────────────────────────────────────────────────────
const intentions = [
  {
    id: "obra",
    icon: ShoppingBag,
    label: "Aquisição de Obra",
    desc: "Interesse em comprar ou reservar uma peça",
    subject: "Interesse em adquirir uma obra",
    accent: GOLD,
  },
  {
    id: "formacao",
    icon: GraduationCap,
    label: "Orientação / Formação",
    desc: "Aulas, orientação artística ou workshops",
    subject: "Informações sobre formação e orientação",
    accent: GOLD_D,
  },
  {
    id: "parceria",
    icon: Handshake,
    label: "Parceria / Exposição",
    desc: "Proposta de colaboração, galeria ou imprensa",
    subject: "Proposta de parceria ou exposição",
    accent: "#2A9D8F",
  },
  {
    id: "outro",
    icon: MessageSquare,
    label: "Outro Assunto",
    desc: "Qualquer outra questão ou mensagem",
    subject: "Outro assunto",
    accent: "#888",
  },
];

const schedule = [
  { day: "Segunda — Sexta", hours: "10:00 – 13:00  ·  14:00 – 19:00" },
  { day: "Sábado", hours: "10:00 – 13:00 (por marcação)" },
  { day: "Domingo", hours: "Encerrado" },
];

const faqItems = [
  {
    q: "Como funcionam os envios das obras?",
    a: "As obras são embaladas em caixas de madeira reforçada de qualidade museológica, com seguro total coberto. O envio para Portugal Continental demora 2 a 3 dias úteis. Para envios internacionais, o prazo e custo são calculados sob consulta.",
  },
  {
    q: "Posso ver a obra antes de comprar?",
    a: "Absolutamente. Recomendamos uma visita presencial ao atelier em Tomar. Se residir fora da região, podemos agendar uma vídeo-chamada para mostrar todos os detalhes da obra ao vivo — luz, textura, escala.",
  },
  {
    q: "Aceitam pagamentos parcelados?",
    a: "Sim. Para obras de maior dimensão ou valor, temos planos de pagamento flexíveis. Entre em contacto para discutirmos uma solução à medida das suas possibilidades.",
  },
  {
    q: "As obras incluem certificado de autenticidade?",
    a: "Todas as obras vêm acompanhadas de certificado de autenticidade assinado e numerado, com ficha técnica completa (técnica, dimensões, ano, série).",
  },
  {
    q: "Qual o prazo de resposta às mensagens?",
    a: "Respondemos a todas as mensagens no prazo de 24 a 48 horas em dias úteis. Em períodos de exposição ou workshop, o prazo pode estender-se até 72 horas.",
  },
];

// ── Floating label field ──────────────────────────────────────
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
}

function Field({ label, type = "text", value, onChange, required, textarea, rows = 4 }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  const sharedStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${active ? GOLD : "rgba(0,0,0,0.12)"}`,
    outline: "none",
    padding: "26px 0 12px",
    fontSize: "0.95rem",
    color: "#1a1a1a",
    fontFamily: "var(--font-sans)",
    resize: "none",
    transition: "border-color 0.3s",
    display: "block",
  };

  return (
    <div className="relative">
      <motion.label
        animate={{ y: active ? -14 : 0, scale: active ? 0.78 : 1, color: active ? GOLD : "#bbb" }}
        transition={{ duration: 0.22, ease: [0.2, 0, 0.1, 1] }}
        className="absolute pointer-events-none select-none"
        style={{
          top: 26, left: 0,
          fontSize: "0.75rem", letterSpacing: "0.16em", textTransform: "uppercase",
          transformOrigin: "left center",
          fontFamily: "var(--font-sans)", color: "#bbb",
        }}
      >
        {label}{required && " *"}
      </motion.label>

      {textarea ? (
        <textarea
          rows={rows} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} style={sharedStyle}
        />
      ) : (
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required={required} style={sharedStyle}
        />
      )}

      <motion.div
        animate={{ scaleX: focused ? 1 : 0 }}
        initial={{ scaleX: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute bottom-0 left-0 w-full"
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${GOLD}, #e8b87a)`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

// ── Contact card for mobile hero ──────────────────────────────
function MobileContactCard({
  icon: Icon,
  line1,
  line2,
  href,
}: {
  icon: typeof MapPin;
  line1: string;
  line2: string | null;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3.5">
      <div
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-sm"
        style={{ border: "1px solid rgba(196,149,106,0.3)" }}
      >
        <Icon size={15} color={GOLD} />
      </div>
      <div className="min-w-0">
        <p className="text-[0.88rem] leading-[1.45] break-all" style={{ color: "rgba(255,255,255,0.8)" }}>
          {line1}
        </p>
        {line2 && (
          <p className="text-[0.72rem] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {line2}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block py-3 active:opacity-70 transition-opacity" style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }
  return <div className="py-3">{content}</div>;
}

// ── Main component ────────────────────────────────────────────
export function ContactosPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedIntention, setSelectedIntention] = useState<string>("obra");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [website, setWebsite] = useState("");
  const [siteContent, setSiteContent] = useState({
    contacto_titulo: SITE_CONTENT_DEFAULTS.contacto_titulo,
    contacto_subtitulo: SITE_CONTENT_DEFAULTS.contacto_subtitulo,
    contacto_email: SITE_CONTENT_DEFAULTS.contacto_email,
    contacto_telefone: SITE_CONTENT_DEFAULTS.contacto_telefone,
    contacto_morada: SITE_CONTENT_DEFAULTS.contacto_morada,
    contacto_horario: SITE_CONTENT_DEFAULTS.contacto_horario,
    social_instagram: SITE_CONTENT_DEFAULTS.social_instagram,
  });

  const formRef = useRef<HTMLDivElement>(null);
  const submitLockRef = useRef(false);
  const submitAbortRef = useRef<AbortController | null>(null);
  const submittedAtRef = useRef(Date.now());
  const selectedData = intentions.find(i => i.id === selectedIntention)!;
  const addressLines = splitAddress(siteContent.contacto_morada);
  const telHref = getTelephoneHref(siteContent.contacto_telefone);
  const mailHref = getMailToHref(siteContent.contacto_email);
  const scheduleRows = useMemo(() => {
    return siteContent.contacto_horario
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [day, ...rest] = line.split(":");
        return {
          day: day?.trim() || line,
          hours: rest.join(":").trim() || "",
        };
      });
  }, [siteContent.contacto_horario]);
  const primaryScheduleLine = scheduleRows[0]
    ? `${scheduleRows[0].day}${scheduleRows[0].hours ? ` · ${scheduleRows[0].hours}` : ""}`
    : null;

  useEffect(() => {
    return () => {
      submitAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    async function loadContactContent() {
      try {
        const rows = await getConfigAll();
        const safe = buildSiteContentFromConfigs(rows);
        setSiteContent({
          contacto_titulo: safe.contacto_titulo,
          contacto_subtitulo: safe.contacto_subtitulo,
          contacto_email: safe.contacto_email,
          contacto_telefone: safe.contacto_telefone,
          contacto_morada: safe.contacto_morada,
          contacto_horario: safe.contacto_horario,
          social_instagram: safe.social_instagram,
        });
      } catch (error) {
        if (import.meta.env?.DEV) console.error("Failed to load contacto content:", error);
      }
    }
    void loadContactContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    submitAbortRef.current?.abort();
    submitAbortRef.current = new AbortController();
    setSubmitting(true);
    setFormError(null);
    try {
      await enviarContacto({
        nome,
        email,
        telefone: telefone || null,
        mensagem,
        assunto: selectedIntention,
        website,
        submitted_at: submittedAtRef.current,
      }, { signal: submitAbortRef.current.signal });
      setFormSubmitted(true);
    } catch (err) {
      const error = err as { message?: string; name?: string };
      setFormError(error.name === "AbortError" ? "Envio interrompido. Tenta novamente." : (error.message || "Erro ao enviar mensagem. Por favor tenta novamente."));
      submitLockRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = (id: string) => {
    setSelectedIntention(id);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  return (
    <div style={{ background: CREAM }}>

      {/* ══ HERO — dark editorial split ══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[100svh] lg:min-h-[88vh] overflow-hidden">
        {/* Left — dark panel */}
        <div
          className="col-span-1 flex flex-col justify-end relative overflow-hidden px-6 py-14 sm:px-10 md:px-16 lg:px-20"
          style={{
            background: "linear-gradient(150deg, #1a1a1a 0%, #2d2420 70%, #1e1714 100%)",
          }}
        >
          {/* Decorative rings */}
          {[500, 320].map((s, i) => (
            <div key={s} className="pointer-events-none absolute" style={{
              top: i === 0 ? -s * 0.35 : -s * 0.15,
              right: i === 0 ? -s * 0.35 : -s * 0.15,
              width: s, height: s, borderRadius: "50%",
              border: `1px solid rgba(196,149,106,${i === 0 ? 0.1 : 0.07})`,
            }} />
          ))}

          {/* Vertical label — desktop only */}
          <div
            className="hidden lg:flex absolute flex-col items-center gap-2.5"
            style={{ top: "clamp(32px,5vw,60px)", right: 28 }}
          >
            <div className="w-[1px] h-12" style={{ background: "rgba(196,149,106,0.3)" }} />
            <p style={{ writingMode: "vertical-rl", fontSize: "0.5rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(196,149,106,0.5)" }}>
              Atelier Ana Alexandre
            </p>
          </div>

          <FadeIn>
            {/* Tag */}
            <p className="text-[0.6rem] tracking-[0.32em] uppercase mb-5 md:mb-6" style={{ color: GOLD }}>
              Contactos
            </p>

            {/* Title */}
            <h1
              className="mb-5 md:mb-7"
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "clamp(2.2rem,6vw,4.4rem)",
                lineHeight: 1.05,
              }}
            >
              {siteContent.contacto_titulo.split(" ")[0] || "Vamos"}
              <br />
              <em style={{ color: GOLD }}>{siteContent.contacto_titulo.split(" ").slice(1).join(" ") || "conversar"}</em>
            </h1>

            {/* Subtitle */}
            <p
              className="max-w-[380px] mb-8 md:mb-12"
              style={{ color: "rgba(255,255,255,0.48)", fontSize: "0.93rem", lineHeight: 1.8 }}
            >
              {siteContent.contacto_subtitulo}
            </p>

            {/* Contact details — optimized for mobile touch */}
            <div className="flex flex-col gap-1 mb-6">
              <MobileContactCard icon={MapPin} line1={addressLines.line1} line2={addressLines.line2 || null} />
              <MobileContactCard icon={Phone} line1={siteContent.contacto_telefone} line2={primaryScheduleLine} href={telHref} />
              <MobileContactCard icon={Mail} line1={siteContent.contacto_email} line2={null} href={mailHref} />
            </div>

            {/* Social */}
            <div className="flex gap-3">
              {([
                { icon: Instagram, label: "Instagram" },
                { icon: Mail, label: "Email" },
              ] as const).map(({ icon: Icon, label }) => (
                <a key={label} href={label === "Instagram" ? siteContent.social_instagram : mailHref} aria-label={label}
                  className="w-11 h-11 flex items-center justify-center transition-all active:scale-95"
                  style={{ border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>

            {/* Scroll hint — mobile only */}
            <motion.div
              className="flex lg:hidden items-center justify-center mt-8"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2" style={{ color: "rgba(196,149,106,0.4)" }}>
                <ArrowDown size={14} />
                <span className="text-[0.6rem] tracking-[0.2em] uppercase">Deslize para continuar</span>
              </div>
            </motion.div>
          </FadeIn>
        </div>

        {/* Right — image (desktop) */}
        <div className="hidden lg:block relative overflow-hidden" style={{ minHeight: "45vw" }}>
          <ImageWithFallback src={IMG_TOMAR} alt="Tomar, Portugal"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.82) saturate(0.9)" }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,22,18,0.28) 0%, transparent 35%)" }} />

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            className="absolute bottom-8 right-8 flex items-center gap-3 p-3.5 pr-5"
            style={{
              background: "rgba(250,247,242,0.96)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(196,149,106,0.22)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.16)",
            }}
          >
            <MapPin size={15} color={GOLD} />
            <div>
              <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "0.85rem", lineHeight: 1.2 }}>Tomar, Portugal</p>
              <p className="text-[0.68rem] mt-0.5" style={{ color: "#aaa" }}>Atelier · Visita por marcação</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ INTENTION SELECTOR ══ */}
      <section className="py-14 md:py-20 lg:py-24 border-t border-black/[0.06]" style={{ background: WARM }}>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
          <FadeIn>
            <div className="text-center mb-10 md:mb-14">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>
                Motivo do contacto
              </p>
              <h2
                className="mb-3"
                style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.2 }}
              >
                Como podemos ajudar?
              </h2>
              <p className="text-[0.88rem]" style={{ color: "#aaa" }}>
                Selecione o assunto para prosseguir.
              </p>
            </div>
          </FadeIn>

          {/* Cards — 1 col mobile, 2 col tablet, 4 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-[2px]">
            {intentions.map((intent, i) => {
              const Icon = intent.icon;
              const active = selectedIntention === intent.id;
              return (
                <FadeIn key={intent.id} delay={i * 0.06}>
                  <motion.button
                    onClick={() => scrollToForm(intent.id)}
                    whileTap={{ scale: 0.97 }}
                    className="w-full text-left cursor-pointer relative"
                    style={{
                      background: active ? "linear-gradient(135deg, #C9A96E 0%, #b07d48 100%)" : "#fff",
                      border: `1px solid ${active ? "#C9A96E" : "rgba(0,0,0,0.07)"}`,
                      padding: "clamp(20px,3vw,32px) clamp(18px,2.5vw,28px)",
                      display: "flex", flexDirection: "column", gap: "14px",
                      transition: "background 0.3s, border-color 0.3s",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300"
                      style={{ background: active ? "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))" : "transparent" }}
                    />

                    <div
                      className="w-11 h-11 flex items-center justify-center transition-colors duration-300"
                      style={{ border: `1px solid ${active ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)"}` }}
                    >
                      <Icon size={17} color={active ? "#fff" : intent.accent} />
                    </div>

                    <div>
                      <p
                        className="text-[0.95rem] mb-1 leading-[1.3] transition-colors duration-300"
                        style={{ fontFamily: "var(--font-serif)", color: active ? "#fff" : "#1a1a1a" }}
                      >
                        {intent.label}
                      </p>
                      <p
                        className="text-[0.75rem] leading-[1.5] transition-colors duration-300"
                        style={{ color: active ? "rgba(255,255,255,0.65)" : "#bbb" }}
                      >
                        {intent.desc}
                      </p>
                    </div>

                    {active && (
                      <div
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)" }}
                      >
                        <Check size={10} color="#fff" />
                      </div>
                    )}
                  </motion.button>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ FORM + INFO ══ */}
      <section ref={formRef} className="py-14 md:py-20 lg:py-24 bg-white scroll-mt-4">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* ── FORM ── */}
            <FadeIn direction="left">
              <div>
                <div className="mb-8 md:mb-10">
                  <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-2.5" style={{ color: GOLD }}>Formulário</p>
                  <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "clamp(1.5rem,2.8vw,2.2rem)", lineHeight: 1.2 }}>
                    Envie uma mensagem
                  </h2>
                </div>

                {/* Selected intention badge */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIntention}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2.5 px-4 py-3 mb-8"
                    style={{ background: "rgba(196,149,106,0.07)", border: "1px solid rgba(196,149,106,0.2)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                    <p className="text-[0.78rem] tracking-[0.03em]" style={{ color: SEPIA }}>{selectedData.subject}</p>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {formSubmitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                      className="py-14 px-8 text-center"
                      style={{ border: "1px solid rgba(196,149,106,0.2)", background: CREAM }}
                    >
                      <div
                        className="w-14 h-14 mx-auto mb-6 flex items-center justify-center"
                        style={{ border: "1px solid rgba(196,149,106,0.4)" }}
                      >
                        <Check size={22} color={GOLD} />
                      </div>
                      <p className="text-[1.25rem] mb-2.5" style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}>
                        Mensagem enviada
                      </p>
                      <p className="text-[0.88rem] leading-[1.7]" style={{ color: "#aaa" }}>
                        Recebemos a sua mensagem. Entraremos em contacto em 24 a 48 horas em dias úteis.
                      </p>
                      <button
                        onClick={() => {
                          submitLockRef.current = false;
                          submittedAtRef.current = Date.now();
                          setFormSubmitted(false);
                          setNome("");
                          setEmail("");
                          setTelefone("");
                          setMensagem("");
                          setWebsite("");
                          setFormError(null);
                        }}
                        className="mt-7 text-[0.7rem] tracking-[0.12em] uppercase cursor-pointer bg-transparent border-none pb-0.5"
                        style={{ color: GOLD, borderBottom: `1px solid ${GOLD}` }}
                      >
                        Enviar outra mensagem
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form" onSubmit={handleSubmit} initial={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col gap-7 md:gap-8"
                      aria-busy={submitting}
                    >
                      <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
                        <label htmlFor="contact-website">Website</label>
                        <input
                          id="contact-website"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-7">
                        <Field label="Nome" value={nome} onChange={setNome} required />
                        <Field label="Email" type="email" value={email} onChange={setEmail} required />
                      </div>
                      <Field label="Telefone (opcional)" type="tel" value={telefone} onChange={setTelefone} />
                      <Field label="Mensagem" value={mensagem} onChange={setMensagem} required textarea rows={5} />

                      <p className="text-[0.72rem] leading-[1.6]" style={{ color: "#ccc" }}>
                        Os seus dados são utilizados exclusivamente para responder à sua mensagem, em conformidade com o RGPD.
                      </p>

                      {formError && (
                        <p role="alert" aria-live="polite" style={{ fontSize: "0.8rem", color: "#B91C1C", textAlign: "center" }}>
                          {formError}
                        </p>
                      )}

                      <div>
                        <motion.button
                          type="submit" disabled={submitting}
                          aria-disabled={submitting}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-3 text-white border-none cursor-pointer transition-all w-full justify-center active:opacity-80"
                          style={{
                            background: submitting ? "#bbb" : "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                            padding: "18px 32px",
                            fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase",
                            minHeight: "56px",
                            boxShadow: submitting ? "none" : "0 4px 20px rgba(201,169,110,0.25)",
                          }}
                        >
                          {submitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
                              />
                              A enviar…
                            </>
                          ) : (
                            <>Enviar Mensagem <Send size={14} /></>
                          )}
                        </motion.button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>

            {/* ── INFO PANEL ── */}
            <FadeIn delay={0.12}>
              <div className="flex flex-col gap-[2px]">

                {/* Address */}
                <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10" style={{ background: "linear-gradient(135deg, #C9A96E 0%, #b07d48 100%)" }}>
                  <div className="pointer-events-none absolute -bottom-16 -right-16 w-[200px] h-[200px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
                  <p className="text-[0.55rem] tracking-[0.28em] uppercase mb-5" style={{ color: "rgba(255,255,255,0.7)" }}>Localização</p>
                  <div className="flex gap-3.5 items-start mb-6">
                    <MapPin size={15} color="#fff" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[0.95rem] leading-[1.5] mb-1" style={{ color: "#fff" }}>{addressLines.line1}</p>
                      <p className="text-[0.82rem]" style={{ color: "rgba(255,255,255,0.6)" }}>{addressLines.line2 || "Tomar, Portugal"}</p>
                    </div>
                  </div>

                  {/* Stylised map */}
                  <div className="relative overflow-hidden mb-5"
                    style={{ border: "1px solid rgba(255,255,255,0.2)", height: "220px" }}
                  >
                    <iframe
                      src="https://maps.google.com/maps?q=Tomar,Portugal&t=&z=14&ie=UTF8&iwloc=&output=embed"
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: "block", filter: "sepia(0.3) saturate(1.1) brightness(0.95)" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Tomar, Portugal"
                    />
                  </div>

                  <a href="https://maps.google.com/?q=Tomar,Portugal" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[0.68rem] tracking-[0.1em] uppercase transition-colors active:opacity-70"
                    style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
                  >
                    Abrir no Google Maps <ExternalLink size={11} />
                  </a>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-4 p-6 sm:p-8 lg:p-9" style={{ background: WARM }}>
                  <p className="text-[0.55rem] tracking-[0.28em] uppercase" style={{ color: GOLD }}>Contacto Directo</p>
                  <a href={telHref}
                    className="flex items-center gap-3 transition-opacity active:opacity-60 min-h-[44px]"
                    style={{ textDecoration: "none", color: "#1a1a1a" }}
                  >
                    <Phone size={14} color={SEPIA} />
                    <span className="text-[0.92rem]">{siteContent.contacto_telefone}</span>
                  </a>
                  <a href={mailHref}
                    className="flex items-center gap-3 transition-opacity active:opacity-60 min-h-[44px] min-w-0"
                    style={{ textDecoration: "none", color: "#1a1a1a" }}
                  >
                    <Mail size={14} color={SEPIA} className="flex-shrink-0" />
                    <span className="text-[0.82rem] sm:text-[0.85rem] break-all" style={{ color: "#666" }}>
                      {siteContent.contacto_email}
                    </span>
                  </a>
                </div>

                {/* Schedule */}
                <div className="p-6 sm:p-8 lg:p-9" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <div className="flex items-center gap-2 mb-5">
                    <Clock size={13} color={GOLD} />
                    <p className="text-[0.55rem] tracking-[0.28em] uppercase" style={{ color: GOLD }}>Horário</p>
                  </div>
                  <div className="flex flex-col">
                    {scheduleRows.map((s, index) => (
                      <div key={`${s.day}-${index}`} className="flex justify-between items-baseline gap-3 pb-3 mb-3 border-b border-black/[0.05] last:border-none last:mb-0 last:pb-0">
                        <p className="text-[0.82rem] flex-shrink-0" style={{ color: "#1a1a1a" }}>{s.day}</p>
                        <p className="text-[0.72rem] text-right" style={{ color: "#aaa" }}>{s.hours}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[0.68rem] leading-[1.7] mt-4" style={{ color: "#ccc" }}>
                    Visitas ao atelier apenas com marcação prévia.<br />Resposta garantida em 24–48h úteis.
                  </p>
                </div>

              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ O ESPAÇO — atmospheric banner ══ */}
      <section className="relative overflow-hidden" style={{ height: "clamp(260px,50vw,520px)" }}>
        <ImageWithFallback src={IMG_STUDIO} alt="O Atelier"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.5) saturate(0.8)" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,22,18,0.8) 0%, rgba(26,22,18,0.35) 60%, transparent 100%)" }} />
        <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-16 lg:px-28">
          <FadeIn direction="none">
            <div className="max-w-[440px]">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-4" style={{ color: GOLD }}>O Espaço</p>
              <h2
                className="mb-4"
                style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "clamp(1.5rem,4vw,2.8rem)", lineHeight: 1.15 }}
              >
                Um atelier<br /><em style={{ color: GOLD }}>aberto ao olhar</em>
              </h2>
              <p className="text-[0.88rem] leading-[1.75] max-w-[360px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Situado no coração de Tomar, o atelier é um espaço de trabalho, reflexão e encontro. As visitas são bem-vindas, sempre por marcação prévia.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-16 md:py-28 lg:py-36" style={{ background: "#FAF8F5" }}>
        <div className="max-w-[800px] mx-auto px-5 sm:px-8 md:px-12">
          <FadeIn>
            <div className="mb-10 md:mb-16">
              <p className="text-[0.6rem] tracking-[0.3em] uppercase mb-3" style={{ color: GOLD }}>FAQ</p>
              <h2
                className="mb-2.5"
                style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.2 }}
              >
                Perguntas frequentes
              </h2>
              <p className="text-[1rem] leading-[1.6]" style={{ color: "#aaa" }}>Não encontra resposta? Entre em contacto directamente.</p>
            </div>
          </FadeIn>

          <div className="flex flex-col">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <FadeIn key={i} delay={i * 0.05}>
                  <div
                    className="overflow-hidden"
                    style={{
                      borderBottom: i < faqItems.length - 1 ? `1px solid rgba(201,169,110,0.15)` : "none",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between gap-4 text-left bg-transparent border-none cursor-pointer px-0 py-5 sm:py-7 active:bg-black/[0.01]"
                      style={{ minHeight: "64px" }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: isOpen ? "#1a1a1a" : "#444",
                          fontSize: "1.125rem",
                          lineHeight: 1.35,
                        }}
                      >
                        {item.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0 flex items-center justify-center"
                        style={{ width: 40, height: 40 }}
                      >
                        <ChevronDown size={24} color={GOLD} />
                      </motion.div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: [0.2, 0, 0.1, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-0 pb-6 sm:pb-7 leading-[1.8]" style={{ color: "#888", fontSize: "1rem" }}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM STRIP ══ */}
      <section style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2420 100%)" }} className="py-10 md:py-14 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
          {/* Mobile: stacked vertically / Desktop: horizontal */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
            <FadeIn direction="none">
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-4">
                {([
                  { icon: Phone, text: siteContent.contacto_telefone, href: telHref },
                  { icon: Mail, text: siteContent.contacto_email, href: mailHref },
                  { icon: MapPin, text: addressLines.line2 || addressLines.line1, href: undefined },
                ] as const).map(({ icon: Icon, text, href }) => {
                  const content = (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={13} color={GOLD} className="flex-shrink-0" />
                      <span className="text-[0.8rem] sm:text-[0.82rem] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {text}
                      </span>
                    </div>
                  );
                  return href ? (
                    <a key={text} href={href} className="active:opacity-60 transition-opacity min-w-0" style={{ textDecoration: "none" }}>
                      {content}
                    </a>
                  ) : (
                    <div key={text} className="min-w-0">{content}</div>
                  );
                })}
              </div>
            </FadeIn>

            <FadeIn direction="none" delay={0.1}>
              <div className="flex items-center gap-3">
                <a href={siteContent.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-10 h-10 flex items-center justify-center transition-all active:scale-95"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
                >
                  <Instagram size={15} />
                </a>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
                  @atelieranaalexandre
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
