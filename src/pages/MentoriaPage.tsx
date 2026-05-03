import image_1566f939421df90e36298942ae45397471258acd from 'figma:asset/1566f939421df90e36298942ae45397471258acd.png'
import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight, ArrowUpRight, Check, ChevronDown,
  Star, Clock, Users, Award, BookOpen, Palette, Layers
} from "lucide-react";
import { FadeIn } from "../app/components/FadeIn";
import { ImageWithFallback } from "../app/components/ui/ImageWithFallback";

// ── Palette ──────────────────────────────────────────────────
const GOLD = "#C9A96E";
const GOLD_D = "#a87848";
const SEPIA = "#8B6E4E";
const CREAM = "#faf7f2";
const WARM = "#f2ede8";

// ── Images ───────────────────────────────────────────────────
const IMG_HERO = "https://images.unsplash.com/photo-1771440047988-766001f543a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_MENTOR = "https://images.unsplash.com/photo-1758522275916-2859b5b58197?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_TEXTURE = "https://images.unsplash.com/photo-1604905807502-04d0adfc0df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_SKETCH = "https://images.unsplash.com/photo-1639478700281-fd11ca9e7e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_GALLERY = "https://images.unsplash.com/photo-1766128867459-064fcbfa8781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

// ── Data ─────────────────────────────────────────────────────
const stats = [
  { value: "+500", label: "Alunos formados" },
  { value: "+25", label: "Anos de ensino" },
  { value: "PhD", label: "Investigação artística" },
  { value: "3", label: "Programas distintos" },
];

const programs = [
  {
    id: 1,
    num: "I",
    level: "Iniciante · Intermédio",
    levelColor: GOLD,
    icon: Palette,
    title: "Aulas de Pintura,\nDesenho e Arte Têxtil",
    tagline: "Da folha em branco ao primeiro quadro.",
    description:
      "Aprenda as bases técnicas — cor, composição, luz, materiais — num ambiente intimista e personalizado. Cada aula é construída em função do seu ritmo e objetivos, sem pressão, sem comparações.",
    includes: [
      "Acompanhamento individual ou em grupo reduzido",
      "Materiais incluídos nas primeiras sessões",
      "Acesso ao acervo de referências do atelier",
      "Avaliação de progresso mensal",
    ],
    format: `Semanal · 2h30m por sessão
2x por semana`,
    cta: "Inscrever-me",
    ctaLink: "/contactos",
    image: IMG_TEXTURE,
  },
  {
    id: 2,
    num: "II",
    level: "Avançado",
    levelColor: GOLD_D,
    icon: Award,
    title: "Orientação \nArtística\nPro",
    tagline: "Para artistas que querem expor e vender.",
    description:
      "Análise crítica de portefólio, desbloqueio criativo e orientação de carreira para artistas que já têm prática mas precisam de direção. Sessões individuais centradas na profissionalização.",
    includes: [
      "Sessões de análise crítica de portefólio",
      "Orientação para candidatura a exposições",
      "Estratégia de presença e visibilidade",
      "Rede de contactos do mundo das artes",
    ],
    format: "Individual · 90 min por sessão",
    cta: "Candidatar-me",
    ctaLink: "/contactos",
    image: IMG_SKETCH,
    featured: true,
  },
  {
    id: 3,
    num: "III",
    level: "Intensivo",
    levelColor: "#2A9D8F",
    icon: Layers,
    title: "Workshops\nArtísticos",
    tagline: "Domine uma nova técnica num fim de semana.",
    description:
      'Imersões de um ou dois dias em temas específicos: "Preparação e Textura de Tela", "Pintura Gestual e Criativa" e "Arte Têxtil". Saia com uma competência nova dominada.',
    includes: [
      "Materiais incluídos",
      "Máx. 8 participantes por workshop",
      "Manual de técnicas para levar",
      "Certificado de participação",
    ],
    format: "Fim de semana · 6–8h por sessão",
    cta: "Ver Agenda",
    ctaLink: "/contactos",
    image: IMG_GALLERY,
  },
];

const steps = [
  {
    num: "01",
    title: "Contacto Inicial",
    desc: "Preencha o formulário de contacto e descreva brevemente a sua experiência e o que procura. Respondemos em 48h.",
  },
  {
    num: "02",
    title: "Sessão de Diagnóstico",
    desc: "Uma conversa de 30 min (gratuita) para perceber o seu nível, os seus objetivos e qual o programa mais adequado.",
  },
  {
    num: "03",
    title: "Programa à Medida",
    desc: "Definimos juntos o calendário, a frequência e os objetivos concretos. Tudo adaptado à sua realidade.",
  },
  {
    num: "04",
    title: "Evolução Contínua",
    desc: "Acompanhamento regular com avaliação de progresso, ajuste de percurso e celebração de cada conquista.",
  },
];

const testimonials = [
  {
    id: 1,
    quote:
      "A Ana ajudou-me a desbloquear o meu processo criativo de uma forma que nenhum curso conseguiu. As sessões de orientação artística foram decisivas para a organização da minha primeira exposição individual.",
    name: "Joana Martins",
    role: "Artista Plástica",
    years: "Orientação Pro · 2023",
    initial: "J",
  },
  {
    id: 2,
    quote:
      "O workshop de preparação de telas transformou a minha forma de olhar para os materiais. Aprendi técnicas tradicionais e contemporâneas que raramente se encontram reunidas em manuais.",
    name: "Carlos Santos",
    role: "Estudante de Belas Artes",
    years: "Workshop Técnico · 2024",
    initial: "C",
  },
  {
    id: 3,
    quote:
      "O ambiente do atelier é único – exigente, mas profundamente humano. Foi um percurso transformador, que me permitiu desenvolver o meu trabalho artístico e expor duas peças em contexto de exposição.",
    name: "Maria Loureiro",
    role: "Contabilista -Artista aos fins de semana",
    years: "Aulas Regulares · 2022–2024",
    initial: "M",
  },
];

const faqs = [
  {
    q: "É necessário ter experiência prévia para as aulas regulares?",
    a: "Não. O programa de Pintura, Desenho e Arte Têxtil começa do zero e adapta-se a cada nível. O único requisito é a vontade de aprender.",
  },
  {
    q: "Com que frequência são os workshops artísticos?",
    a: "Organizamos 4 a 6 workshops por ano, geralmente ao fim de semana. Subscreva a newsletter ou consulte a agenda para ficar a par das próximas edições.",
  },
  {
    q: "A Orientação Artística Pro é adequada para artistas a tempo parcial?",
    a: "Sim. Muitos dos alunos têm atividades profissionais paralelas à prática artística. O acompanhamento é sempre ajustado à sua disponibilidade real, com uma cadência e objetivos definidos de forma personalizada.",
  },
  {
    q: "Quais os materiais necessários para começar?",
    a: `Para as primeiras aulas os materiais essenciais são fornecidos.
Posteriormente, será prestada orientação na aquisição de materiais, promovendo um investimento mais eficiente.`,
  },
];

// ── Utility ──────────────────────────────────────────────────
function GoldLine({ width = 48 }: { width?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "28px" }}>
      <div style={{ width, height: 1, background: GOLD }} />
      <div style={{ flex: 1, height: 1, background: "rgba(196,149,106,0.12)" }} />
    </div>
  );
}

// ── Component ────────────────────────────────────────────────
export function MentoriaPage() {
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredProgram, setHoveredProgram] = useState<number | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeProgram, setActiveProgram] = useState(0);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);
  const programScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to hash anchor on navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, [location.hash]);

  const handleTestimonialScroll = useCallback(() => {
    const el = testimonialScrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / testimonials.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveTestimonial(Math.min(index, testimonials.length - 1));
  }, []);

  const scrollToTestimonial = useCallback((index: number) => {
    const el = testimonialScrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / testimonials.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }, []);

  const handleProgramScroll = useCallback(() => {
    const el = programScrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / programs.length;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveProgram(Math.min(index, programs.length - 1));
  }, []);

  const scrollToProgram = useCallback((index: number) => {
    const el = programScrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / programs.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }, []);

  return (
    <div style={{ background: CREAM }}>

      {/* ── Hide-scrollbar utility ── */}
      <style>{`
        .mentoria-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mentoria-hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ══════════════════════════════════
          HERO — editorial split layout
      ══════════════════════════════════ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left — text */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2420 60%, #1a1612 100%)",
            padding: "clamp(48px, 6vw, 80px) clamp(32px, 4vw, 72px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
            minHeight: "38vh",
          }}
        >
          {/* Decorative ring */}
          <div style={{
            position: "absolute", top: -120, right: -120,
            width: 340, height: 340, borderRadius: "50%",
            border: `1px solid rgba(196,149,106,0.15)`,
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            border: `1px solid rgba(196,149,106,0.1)`,
            pointerEvents: "none",
          }} />

          <FadeIn>
            <p style={{
              fontSize: "0.58rem", letterSpacing: "0.32em",
              textTransform: "uppercase", color: GOLD,
              marginBottom: "10px",
            }}>
              Atelier Ana Alexandre · Formação
            </p>

            <h1
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                lineHeight: 1.05,
                marginBottom: "12px",
              }}
            >
              Partilhar<br />
              <em style={{ color: GOLD, fontStyle: "italic" }}>Conhecimento</em>
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.82rem",
              lineHeight: 1.55,
              maxWidth: 420,
              marginBottom: "20px",
            }}>
              Orientação Artística, Aulas de Pintura e Workshops
              num atelier onde a técnica e a alma se encontram.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: "14px", marginTop: "28px", alignItems: "center", flexWrap: "wrap" }}>
              <Link
                to="/contactos"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: GOLD, color: "#1a1a1a",
                  padding: "16px 28px",
                  fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "opacity 0.3s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={e => (e.currentTarget.style.opacity = "1")}
              >
                Marcar Sessão Gratuita
                <ArrowRight size={14} />
              </Link>
              <a
                href="#programas"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  color: "rgba(255,255,255,0.6)",
                  padding: "14px 0",
                  fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.15)",
                  transition: "color 0.3s, border-color 0.3s",
                }}
                onMouseOver={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                onMouseOut={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Ver programas
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Right — image */}
        <div
          style={{ position: "relative", overflow: "hidden", minHeight: "38vh", maxHeight: "38vh" }}
        >
          <ImageWithFallback
            src={IMG_HERO}
            alt="Atelier Ana Alexandre"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              filter: "brightness(0.88) saturate(0.9)",
            }}
          />
          {/* Vignette overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(26,22,18,0.35) 0%, transparent 40%)",
          }} />

          {/* Floating credential badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            style={{
              position: "absolute", bottom: 32, left: 32,
              background: "rgba(250,247,242,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(196,149,106,0.25)",
              padding: "16px 22px",
              display: "flex", flexDirection: "column", gap: "4px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            }}
          >
            <p style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD }}>
              Credenciais
            </p>
            <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "0.88rem", lineHeight: 1.3 }}>
              Doutora em Pintura<br />
              <span style={{ color: "#888", fontSize: "0.78rem" }}>FBAUV · Vigo</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <section style={{ background: GOLD }}>
        <div
          className="grid grid-cols-2 lg:grid-cols-4"
          style={{ maxWidth: 1400, margin: "0 auto" }}
        >
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                }}
                className={`
                  lg:py-7 lg:px-5
                  ${i < stats.length - 1 ? "lg:border-r lg:border-white/18" : ""}
                  ${i % 2 === 0 ? "border-r border-white/15 lg:border-r" : ""}
                  ${i < 2 ? "border-b border-white/15 lg:border-b-0" : ""}
                `}
              >
                <span style={{
                  fontFamily: "var(--font-serif)",
                  color: "#fff", lineHeight: 1,
                }}
                  className="text-[1.6rem] lg:text-[2rem]"
                >
                  {s.value}
                </span>
                <span style={{
                  fontSize: "0.52rem", letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.72)",
                }}>
                  {s.label}
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══ PHILOSOPHY ══ */}
      <section style={{
        background: "#fff",
      }}
        className="py-16 lg:py-[clamp(72px,10vw,120px)]"
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="px-6 lg:px-20">
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-[clamp(40px,8vw,100px)] items-center"
          >
            {/* Image — mobile: centered soft-rounded, desktop: offset frame */}
            <FadeIn direction="left">
              <div style={{ position: "relative" }}>
                {/* Desktop offset frame */}
                <div className="hidden md:block" style={{
                  position: "absolute", top: -16, left: -16,
                  width: "100%", height: "100%",
                  border: `1px solid rgba(196,149,106,0.25)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }} />
                {/* Mobile image */}
                <div
                  className="block md:hidden mx-auto"
                  style={{
                    aspectRatio: "4/5",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                    borderRadius: 16,
                    maxWidth: 280,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
                  }}
                >
                  <ImageWithFallback
                    src={image_1566f939421df90e36298942ae45397471258acd}
                    alt="Atelier — ambiente de trabalho"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
                  />
                </div>
                {/* Desktop image */}
                <div
                  className="hidden md:block"
                  style={{
                    aspectRatio: "4/5",
                    overflow: "hidden",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <ImageWithFallback
                    src={image_1566f939421df90e36298942ae45397471258acd}
                    alt="Atelier — ambiente de trabalho"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
                  />
                </div>
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn delay={0.15}>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "14px" }}>
                Filosofia
              </p>

              <h2 style={{
                fontFamily: "var(--font-serif)",
                color: "#1a1a1a",
                lineHeight: 1.15,
                marginBottom: "24px",
              }}
                className="text-[1.6rem] md:text-[clamp(1.9rem,3.5vw,2.8rem)]"
              >
                O Atelier<br />como Escola
              </h2>

              <GoldLine width={40} />

              <blockquote style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
                color: "#666",
                fontStyle: "italic",
                lineHeight: 1.65,
                marginBottom: "28px",
                paddingLeft: "20px",
                borderLeft: `2px solid rgba(196,149,106,0.4)`,
              }}>
                "Descubra a sua voz interior através da criação intuitiva. A técnica liberta — a voz emerge."
              </blockquote>

              <p style={{ color: "#888", lineHeight: 1.85, marginBottom: "20px", fontSize: "0.93rem" }}>
                O atelier afirma-se como um espaço de ensino e investigação artística, onde a prática e o pensamento se desenvolvem em paralelo. Sustentado pela formação académica e pelo percurso doutoral em Pintura de Ana Alexandre, bem como por mais de três décadas de experiência em atelier, este modelo pedagógico une exigência, continuidade e profundidade
              </p>

              <p style={{ color: "#aaa", lineHeight: 1.85, fontSize: "0.88rem" }}>
                Cada aluno é orientado como um artista em formação, inserido num percurso estruturado e simultaneamente aberto à singularidade de cada prática. Não se trata de consumir conteúdo, mas de desenvolver um pensamento visual próprio, sustentado e crítico.
              </p>

              {/* Credential tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "32px" }}>
                {["PhD · FBAUP", "Artista Profissional", "10+ Anos Docência", "Orientadora de Portefólio"].map(tag => (
                  <span key={tag} style={{
                    fontSize: "0.54rem", letterSpacing: "0.12em", textTransform: "uppercase",
                    color: SEPIA, border: `1px solid rgba(196,149,106,0.3)`,
                    padding: "5px 12px",
                    background: "rgba(196,149,106,0.05)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS ══ */}
      <section
        id="programas"
        style={{ background: WARM }}
        className="py-16 lg:py-[clamp(72px,10vw,120px)]"
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="px-6 lg:px-20">
          <FadeIn>
            <div style={{ marginBottom: "clamp(48px, 7vw, 80px)" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "14px" }}>
                Programas
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <h2 style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1a1a1a",
                  lineHeight: 1.15,
                  marginBottom: 0,
                }}
                  className="text-[1.6rem] md:text-[clamp(1.9rem,3.5vw,2.8rem)]"
                >
                  Três caminhos,<br />
                  <em style={{ color: GOLD }}>um destino</em>
                </h2>
                <p style={{ color: "#999", fontSize: "0.88rem", maxWidth: 320, lineHeight: 1.7 }}>
                  Seja qual for o seu ponto de partida, existe um programa construído para si.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3" style={{ gap: "2px" }}>
            {programs.map((prog, i) => {
              const Icon = prog.icon;
              const isHovered = hoveredProgram === prog.id;
              return (
                <FadeIn key={prog.id} delay={i * 0.12} className="h-full">
                  <motion.div
                    onHoverStart={() => setHoveredProgram(prog.id)}
                    onHoverEnd={() => setHoveredProgram(null)}
                    animate={{ y: isHovered ? -4 : 0 }}
                    transition={{ duration: 0.3, ease: [0.2, 0, 0.1, 1] }}
                    style={{
                      height: "100%",
                      background: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                      cursor: "default",
                      transition: "box-shadow 0.4s",
                      boxShadow: isHovered
                        ? "0 20px 60px rgba(0,0,0,0.14)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Accent top bar */}
                    <div style={{
                      height: 3,
                      background: prog.featured
                        ? `linear-gradient(90deg, ${GOLD} 0%, #e8b87a 100%)`
                        : prog.levelColor,
                    }} />

                    {/* Image thumbnail */}
                    <div style={{ height: 180, overflow: "hidden", flexShrink: 0 }}>
                      <motion.div
                        animate={{ scale: isHovered ? 1.04 : 1 }}
                        transition={{ duration: 0.6 }}
                        style={{ width: "100%", height: "100%" }}
                      >
                        <ImageWithFallback
                          src={prog.image}
                          alt={prog.title}
                          style={{
                            width: "100%", height: "100%", objectFit: "cover",
                            filter: "brightness(0.82) saturate(0.85)",
                          }}
                        />
                      </motion.div>
                      {/* Numero overlay */}
                      <div style={{
                        position: "absolute", top: 16, right: 16,
                        fontFamily: "var(--font-serif)",
                        fontSize: "3.5rem", lineHeight: 1,
                        color: "rgba(255,255,255,0.18)",
                        pointerEvents: "none",
                        userSelect: "none",
                        zIndex: 2,
                      }}>
                        {prog.num}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "clamp(22px, 3.5vw, 34px)", flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Level badge + Icon row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                        <span style={{
                          fontSize: "0.48rem", letterSpacing: "0.22em", textTransform: "uppercase",
                          color: "#1a1a1a",
                          background: "rgba(196,149,106,0.08)",
                          border: `1px solid rgba(196,149,106,0.22)`,
                          padding: "5px 11px",
                        }}>
                          {prog.level}
                        </span>
                        <div style={{
                          width: 34, height: 34,
                          background: "rgba(196,149,106,0.06)",
                          border: `1px solid rgba(196,149,106,0.2)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Icon size={15} color={GOLD} />
                        </div>
                      </div>
                      {/* Gold accent line */}
                      <div style={{ width: 36, height: 2, background: `linear-gradient(90deg, ${GOLD} 0%, rgba(196,149,106,0.18) 100%)`, marginBottom: "18px" }} />

                      <h3 style={{
                        fontFamily: "var(--font-serif)",
                        color: "#1a1a1a",
                        fontSize: "clamp(1.2rem, 1.8vw, 1.45rem)",
                        lineHeight: 1.2,
                        marginBottom: "6px",
                        whiteSpace: "pre-line",
                        minHeight: "3.6rem",
                      }}>
                        {prog.title.replace(/\nPro$/, '')}
                      </h3>

                      <p style={{
                        fontSize: "0.8rem", letterSpacing: "0.03em",
                        color: GOLD,
                        marginBottom: "16px", fontStyle: "italic",
                        fontFamily: "var(--font-serif)",
                        opacity: 0.88,
                      }}>
                        {prog.tagline}
                      </p>

                      {/* Thin divider */}
                      <div style={{ width: "100%", height: 1, background: "rgba(0,0,0,0.07)", marginBottom: "16px" }} />

                      <p style={{
                        fontSize: "0.86rem", lineHeight: 1.78,
                        color: "#6b6b6b",
                        marginBottom: "22px",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: "calc(0.86rem * 1.78 * 4)",
                      }}>
                        {prog.description}
                      </p>

                      {/* Includes list — diamond bullets */}
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {prog.includes.map(item => (
                          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "11px" }}>
                            <span style={{
                              marginTop: "5px", flexShrink: 0,
                              width: 6, height: 6,
                              background: GOLD,
                              transform: "rotate(45deg)",
                              display: "inline-block",
                              opacity: 0.85,
                            }} />
                            <span style={{
                              fontSize: "0.82rem", lineHeight: 1.55,
                              color: "#5a5a5a",
                            }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Format pill */}
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "7px 13px",
                        background: "rgba(196,149,106,0.05)",
                        border: `1px solid rgba(196,149,106,0.28)`,
                        marginBottom: "26px",
                        alignSelf: "flex-start",
                      }}>
                        <Clock size={11} color={GOLD} style={{ opacity: 0.75 }} />
                        <span style={{
                          fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase",
                          color: SEPIA,
                          whiteSpace: "pre-line"
                        }}>
                          {prog.format}
                        </span>
                      </div>

                      {/* CTA */}
                      <div style={{ marginTop: "auto" }}>
                        <Link
                          to={prog.ctaLink}
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px",
                            color: "#1a1a1a",
                            background: GOLD,
                            padding: "14px 24px",
                            fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase",
                            textDecoration: "none",
                            width: "100%",
                            transition: "background 0.3s, letter-spacing 0.3s",
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = "#b8945e";
                            e.currentTarget.style.letterSpacing = "0.2em";
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = GOLD;
                            e.currentTarget.style.letterSpacing = "0.16em";
                          }}
                        >
                          {prog.cta}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>

          {/* Mobile: horizontal snap carousel */}
          <div className="md:hidden">
            <div
              ref={programScrollRef}
              onScroll={handleProgramScroll}
              className="mentoria-hide-scrollbar -mx-6"
              style={{
                display: "flex",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingLeft: 24,
                paddingRight: 24,
                gap: 16,
              }}
            >
              {programs.map((prog, i) => {
                const Icon = prog.icon;
                return (
                  <div
                    key={prog.id}
                    style={{
                      scrollSnapAlign: "center",
                      flexShrink: 0,
                      width: "calc(100vw - 64px)",
                      maxWidth: 320,
                      height: "auto",
                    }}
                  >
                    <div style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      background: "#fff",
                      overflow: "hidden",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(196,149,106,0.1)",
                    }}>
                      {/* Accent top bar */}
                      <div style={{
                        height: 3,
                        background: prog.featured
                          ? `linear-gradient(90deg, ${GOLD} 0%, #e8b87a 100%)`
                          : prog.levelColor,
                      }} />

                      {/* Image */}
                      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
                        <ImageWithFallback
                          src={prog.image}
                          alt={prog.title}
                          style={{
                            width: "100%", height: "100%", objectFit: "cover",
                            filter: "brightness(0.82) saturate(0.85)",
                          }}
                        />
                        <div style={{
                          position: "absolute", top: 12, right: 14,
                          fontFamily: "var(--font-serif)",
                          fontSize: "2.8rem", lineHeight: 1,
                          color: "rgba(255,255,255,0.2)",
                          pointerEvents: "none",
                        }}>
                          {prog.num}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ padding: "24px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                        {/* Level + Icon */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                          <span style={{
                            fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase",
                            color: "#1a1a1a", background: "rgba(196,149,106,0.08)",
                            border: "1px solid rgba(196,149,106,0.22)", padding: "5px 10px",
                          }}>
                            {prog.level}
                          </span>
                          <div style={{
                            width: 32, height: 32, background: "rgba(196,149,106,0.06)",
                            border: "1px solid rgba(196,149,106,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon size={14} color={GOLD} />
                          </div>
                        </div>

                        <div style={{ width: 32, height: 2, background: GOLD, marginBottom: 14, opacity: 0.6 }} />

                        <h3 style={{
                          fontFamily: "var(--font-serif)", color: "#1a1a1a",
                          fontSize: "1.15rem", lineHeight: 1.25, marginBottom: 6,
                          whiteSpace: "pre-line",
                        }}>
                          {prog.title.replace(/\nPro$/, '')}
                        </h3>

                        <p style={{
                          fontSize: "0.82rem", color: GOLD, fontStyle: "italic",
                          fontFamily: "var(--font-serif)", marginBottom: 14, opacity: 0.88,
                        }}>
                          {prog.tagline}
                        </p>

                        <div style={{ width: "100%", height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 14 }} />

                        <p style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#6b6b6b", marginBottom: 18 }}>
                          {prog.description}
                        </p>

                        {/* Includes — compact */}
                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                          {prog.includes.map(item => (
                            <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <span style={{
                                marginTop: 6, flexShrink: 0, width: 5, height: 5,
                                background: GOLD, transform: "rotate(45deg)", opacity: 0.85,
                              }} />
                              <span style={{ fontSize: "0.84rem", lineHeight: 1.5, color: "#5a5a5a" }}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Format */}
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "6px 12px", background: "rgba(196,149,106,0.05)",
                          border: "1px solid rgba(196,149,106,0.25)", marginBottom: 20,
                        }}>
                          <Clock size={11} color={GOLD} style={{ opacity: 0.75 }} />
                          <span style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: SEPIA, whiteSpace: "pre-line" }}>
                            {prog.format}
                          </span>
                        </div>

                        {/* CTA */}
                        <Link
                          to={prog.ctaLink}
                          style={{
                            marginTop: "auto",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                            color: "#fff", padding: "15px 24px",
                            fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase",
                            textDecoration: "none", minHeight: 52,
                            boxShadow: "0 4px 16px rgba(201,169,110,0.25)",
                          }}
                        >
                          {prog.cta}
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {programs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToProgram(i)}
                  aria-label={`Programa ${i + 1}`}
                  style={{
                    width: activeProgram === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: activeProgram === i ? GOLD : "rgba(201,169,110,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMO FUNCIONA ══ */}
      <section style={{
        background: "#fff",
      }}
        className="py-16 lg:py-[clamp(72px,10vw,120px)]"
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }} className="px-6 lg:px-20">
          {/* ── Header ── */}
          <FadeIn>
            <div style={{ marginBottom: "clamp(48px, 7vw, 80px)", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 1, background: GOLD }} />
                  <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD }}>
                    Processo
                  </p>
                </div>
                <h2 style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1a1a1a",
                  fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
                  lineHeight: 1.15, marginBottom: 0,
                }}>
                  Como começa<br />
                  <em style={{ color: GOLD }}>a sua jornada</em>
                </h2>
              </div>
              <p style={{ color: "#bbb", fontSize: "0.88rem", maxWidth: 300, lineHeight: 1.8, paddingBottom: 4 }}>
                Quatro passos simples para começar a criar com intenção, técnica e clareza.
              </p>
            </div>
          </FadeIn>

          {/* ── Steps grid ── */}
          {/* ── Desktop roadmap: flex row com setas diamante ── */}
          <div className="hidden lg:flex" style={{ alignItems: "stretch" }}>
            {steps.map((step, i) => {
              const stepIcons = [Users, BookOpen, Layers, Award];
              const StepIcon = stepIcons[i] || Award;
              const isLast = i === steps.length - 1;
              return (
                <div key={step.num} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>

                  {/* Card */}
                  <FadeIn delay={i * 0.12} style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        position: "relative",
                        background: "linear-gradient(150deg, #ffffff 0%, #fdf9f4 60%, #f8f2e8 100%)",
                        border: "1px solid rgba(196,149,106,0.18)",
                        padding: "clamp(28px, 3.5vw, 44px) clamp(18px, 2.2vw, 30px)",
                        overflow: "hidden",
                        minHeight: 300,
                        height: "100%",
                        display: "flex", flexDirection: "column",
                        transition: "transform 0.35s cubic-bezier(0.2,0,0.1,1), box-shadow 0.35s, border-color 0.35s",
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow = "0 20px 52px rgba(196,149,106,0.16)";
                        e.currentTarget.style.borderColor = "rgba(196,149,106,0.5)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.borderColor = "rgba(196,149,106,0.18)";
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${GOLD} 0%, rgba(196,149,106,0.25) 100%)` }} />
                      <div style={{
                        position: "absolute", bottom: -16, right: 10,
                        fontFamily: "var(--font-serif)", fontSize: "7rem", lineHeight: 1,
                        color: "rgba(196,149,106,0.07)", userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
                      }}>{step.num}</div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <div style={{
                          width: 38, height: 38, flexShrink: 0,
                          border: `1px solid rgba(196,149,106,0.35)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(196,149,106,0.08)",
                        }}>
                          <StepIcon size={15} color={GOLD} />
                        </div>
                        <span style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: SEPIA }}>
                          Passo {step.num}
                        </span>
                      </div>

                      <h3 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1.1rem", marginBottom: "12px", lineHeight: 1.25 }}>
                        {step.title}
                      </h3>
                      <p style={{ color: "#999", fontSize: "0.82rem", lineHeight: 1.8, flex: 1 }}>
                        {step.desc}
                      </p>
                      <div style={{ marginTop: 22, width: 24, height: 1, background: "rgba(196,149,106,0.4)" }} />
                    </div>
                  </FadeIn>

                  {/* Seta roadmap entre cards */}
                  {!isLast && (
                    <FadeIn delay={i * 0.12 + 0.2}>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 48, flexShrink: 0, position: "relative",
                      }}>
                        {/* Linha esquerda */}
                        <div style={{
                          position: "absolute", top: "50%", left: 0,
                          width: "calc(50% - 13px)", height: 1,
                          background: `linear-gradient(90deg, rgba(196,149,106,0.25) 0%, ${GOLD} 100%)`,
                          transform: "translateY(-50%)",
                        }} />
                        {/* Linha direita */}
                        <div style={{
                          position: "absolute", top: "50%", right: 0,
                          width: "calc(50% - 13px)", height: 1,
                          background: `linear-gradient(90deg, ${GOLD} 0%, rgba(196,149,106,0.25) 100%)`,
                          transform: "translateY(-50%)",
                        }} />
                        {/* Diamante central */}
                        <div style={{
                          position: "relative", zIndex: 1,
                          width: 24, height: 24,
                          background: "linear-gradient(135deg, #fdf9f4, #fff8ee)",
                          border: `1px solid ${GOLD}`,
                          transform: "rotate(45deg)",
                          boxShadow: `0 0 10px rgba(196,149,106,0.25)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {/* Chevron interno */}
                          <div style={{
                            width: 6, height: 6,
                            borderTop: `1.5px solid ${GOLD}`,
                            borderRight: `1.5px solid ${GOLD}`,
                            transform: "translate(-1px, 1px)",
                          }} />
                        </div>
                      </div>
                    </FadeIn>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Mobile roadmap: stack vertical com setas ── */}
          <div className="flex lg:hidden" style={{ flexDirection: "column" }}>
            {steps.map((step, i) => {
              const stepIcons = [Users, BookOpen, Layers, Award];
              const StepIcon = stepIcons[i] || Award;
              const isLast = i === steps.length - 1;
              return (
                <div key={step.num}>
                  <FadeIn delay={i * 0.1}>
                    <div style={{
                      position: "relative",
                      background: "linear-gradient(150deg, #ffffff 0%, #fdf9f4 60%, #f8f2e8 100%)",
                      border: "1px solid rgba(196,149,106,0.18)",
                      padding: "32px 28px",
                      overflow: "hidden",
                      display: "flex", flexDirection: "column",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${GOLD} 0%, rgba(196,149,106,0.25) 100%)` }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, border: `1px solid rgba(196,149,106,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(196,149,106,0.08)" }}>
                          <StepIcon size={14} color={GOLD} />
                        </div>
                        <span style={{ fontSize: "0.52rem", letterSpacing: "0.22em", textTransform: "uppercase", color: SEPIA }}>Passo {step.num}</span>
                      </div>
                      <h3 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1.1rem", marginBottom: "10px", lineHeight: 1.25 }}>{step.title}</h3>
                      <p style={{ color: "#999", fontSize: "0.82rem", lineHeight: 1.8 }}>{step.desc}</p>
                    </div>
                  </FadeIn>

                  {!isLast && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
                      <div style={{ width: 1, height: 18, background: `linear-gradient(180deg, rgba(196,149,106,0.3) 0%, ${GOLD} 100%)` }} />
                      <div style={{
                        width: 22, height: 22,
                        border: `1px solid ${GOLD}`,
                        background: "linear-gradient(135deg, #fdf9f4, #fff8ee)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transform: "rotate(45deg)",
                        boxShadow: `0 0 8px rgba(196,149,106,0.2)`,
                      }}>
                        <div style={{ width: 6, height: 6, borderBottom: `1.5px solid ${GOLD}`, borderRight: `1.5px solid ${GOLD}`, transform: "translate(-1px, -1px)" }} />
                      </div>
                      <div style={{ width: 1, height: 18, background: `linear-gradient(180deg, ${GOLD} 0%, rgba(196,149,106,0.3) 100%)` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── CTA Banner ── */}
          <FadeIn delay={0.3}>
            <div style={{
              marginTop: "clamp(48px, 7vw, 72px)",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(130deg, #fff8f0 0%, #fdf3e7 50%, #faf8f5 100%)",
              border: "1px solid rgba(196,149,106,0.22)",
              padding: "clamp(36px, 5vw, 60px) clamp(28px, 5vw, 64px)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 32, flexWrap: "wrap",
            }}>
              {/* Decorative rings */}
              <div style={{
                position: "absolute", right: -80, top: "50%", transform: "translateY(-50%)",
                width: 340, height: 340, borderRadius: "50%",
                border: "1px solid rgba(196,149,106,0.2)", pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)",
                width: 200, height: 200, borderRadius: "50%",
                border: "1px solid rgba(196,149,106,0.14)", pointerEvents: "none",
              }} />
              {/* Gold top line */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, ${GOLD} 0%, rgba(196,149,106,0.3) 60%, transparent 100%)` }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>
                  Primeiro Passo · Sem Compromisso
                </p>
                <p style={{
                  fontFamily: "var(--font-serif)", color: "#1a1a1a",
                  fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", marginBottom: 10, lineHeight: 1.2,
                }}>
                  Sessão de Diagnóstico — Gratuita
                </p>
                <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  30 minutos para perceber o caminho certo.<br />Uma conversa, não uma entrevista.
                </p>
              </div>

              <Link
                to="/contactos"
                className="w-full sm:w-auto"
                style={{
                  position: "relative", zIndex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                  color: "#fff",
                  padding: "17px 36px", flexShrink: 0,
                  fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase",
                  textDecoration: "none",
                  minHeight: 52,
                  boxShadow: "0 4px 16px rgba(201,169,110,0.25)",
                  transition: "opacity 0.3s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={e => (e.currentTarget.style.opacity = "1")}
              >
                Agendar agora
                <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section id="testemunhos" style={{
        background: "linear-gradient(160deg, #1a1a1a 0%, #2d2420 60%, #1e1714 100%)",
        position: "relative", overflow: "hidden",
      }}
        className="py-16 lg:py-[clamp(72px,10vw,120px)]"
      >
        {/* Decorative elements */}
        {[600, 400].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            top: i === 0 ? -size * 0.3 : undefined,
            bottom: i === 1 ? -size * 0.3 : undefined,
            right: i === 0 ? -size * 0.2 : undefined,
            left: i === 1 ? -size * 0.2 : undefined,
            width: size, height: size, borderRadius: "50%",
            border: `1px solid rgba(196,149,106,${i === 0 ? 0.1 : 0.06})`,
            pointerEvents: "none",
          }} />
        ))}

        <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }} className="px-6 lg:px-20">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "clamp(48px, 7vw, 72px)" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "14px" }}>
                Testemunhos
              </p>
              <h2 style={{
                fontFamily: "var(--font-serif)", color: "#fff",
                fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", lineHeight: 1.15, marginBottom: 0,
              }}>
                O que dizem os alunos
              </h2>
            </div>
          </FadeIn>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3" style={{ gap: "24px" }}>
            {testimonials.map((t, i) => (
              <FadeIn key={t.id} delay={i * 0.12}>
                <div style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "clamp(28px, 4vw, 40px)",
                  display: "flex", flexDirection: "column", height: "100%",
                  position: "relative",
                  transition: "background 0.4s, border-color 0.4s",
                }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(196,149,106,0.3)";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {/* Large quote mark */}
                  <div style={{
                    position: "absolute", top: 20, right: 24,
                    fontFamily: "var(--font-serif)",
                    fontSize: "5rem", lineHeight: 1,
                    color: "rgba(196,149,106,0.12)",
                    userSelect: "none", pointerEvents: "none",
                  }}>
                    &ldquo;
                  </div>

                  {/* Stars */}
                  <div style={{ display: "flex", gap: "3px", marginBottom: "20px" }}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={11} fill={GOLD} color={GOLD} />
                    ))}
                  </div>

                  <p style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.97rem", lineHeight: 1.8,
                    color: "rgba(255,255,255,0.65)",
                    fontStyle: "italic",
                    flex: 1, marginBottom: "28px",
                  }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: 44, height: 44,
                      border: `1px solid rgba(196,149,106,0.35)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1rem", color: GOLD,
                      }}>
                        {t.initial}
                      </span>
                    </div>
                    <div>
                      <p style={{ color: "#fff", fontSize: "0.85rem", marginBottom: "2px" }}>{t.name}</p>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{t.role}</p>
                      <p style={{ color: GOLD, fontSize: "0.6rem", letterSpacing: "0.08em", marginTop: "2px" }}>{t.years}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Mobile: single-card snap slider */}
          <div className="md:hidden">
            <div
              ref={testimonialScrollRef}
              onScroll={handleTestimonialScroll}
              className="mentoria-hide-scrollbar -mx-6"
              style={{
                display: "flex",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingLeft: 24,
                paddingRight: 24,
                gap: 16,
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    scrollSnapAlign: "center",
                    flexShrink: 0,
                    width: "calc(100vw - 64px)",
                    maxWidth: 340,
                  }}
                >
                  <div style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "28px 24px",
                    position: "relative",
                    height: "100%",
                  }}>
                    {/* Quote mark */}
                    <div style={{
                      position: "absolute", top: 16, right: 20,
                      fontFamily: "var(--font-serif)",
                      fontSize: "3.5rem", lineHeight: 1,
                      color: "rgba(196,149,106,0.15)",
                      userSelect: "none", pointerEvents: "none",
                    }}>
                      &ldquo;
                    </div>

                    {/* Stars */}
                    <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={12} fill={GOLD} color={GOLD} />
                      ))}
                    </div>

                    <p style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "0.95rem", lineHeight: 1.7,
                      color: "rgba(255,255,255,0.6)",
                      fontStyle: "italic",
                      marginBottom: 24,
                    }}>
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 42, height: 42,
                        border: "1px solid rgba(196,149,106,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: GOLD }}>{t.initial}</span>
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontSize: "0.88rem", marginBottom: 2 }}>{t.name}</p>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.76rem" }}>{t.role}</p>
                        <p style={{ color: GOLD, fontSize: "0.58rem", letterSpacing: "0.08em", marginTop: 2 }}>{t.years}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToTestimonial(i)}
                  aria-label={`Testemunho ${i + 1}`}
                  style={{
                    width: activeTestimonial === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: activeTestimonial === i ? GOLD : "rgba(201,169,110,0.3)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═ FAQ ══ */}
      <section id="faq" style={{ background: "#fff" }} className="py-16 lg:py-[clamp(72px,10vw,120px)]">
        <div style={{ maxWidth: 760, margin: "0 auto" }} className="px-6 lg:px-12">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "clamp(40px, 6vw, 64px)" }}>
              <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "14px" }}>
                FAQ
              </p>
              <h2 style={{
                fontFamily: "var(--font-serif)", color: "#1a1a1a",
                fontSize: "clamp(1.7rem, 3vw, 2.4rem)", lineHeight: 1.2, marginBottom: 0,
              }}>
                Perguntas frequentes
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <FadeIn key={i} delay={i * 0.06}>
                  <div style={{
                    border: "1px solid rgba(0,0,0,0.07)",
                    background: isOpen ? WARM : "#fff",
                    transition: "background 0.3s",
                    overflow: "hidden",
                  }}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 14, background: "none", border: "none",
                        cursor: "pointer", textAlign: "left",
                        minHeight: 56,
                      }}
                      className="px-5 py-4 lg:px-6 lg:py-5"
                    >
                      <span style={{
                        fontFamily: "var(--font-serif)",
                        color: "#1a1a1a",
                        lineHeight: 1.4,
                      }}
                        className="text-[0.92rem] lg:text-[0.97rem]"
                      >
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ flexShrink: 0, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <ChevronDown size={18} color={GOLD} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="faq-answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.32, ease: [0.2, 0, 0.1, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <p style={{
                            fontSize: "0.88rem", color: "#888",
                            lineHeight: 1.8,
                            whiteSpace: "pre-line",
                          }}
                            className="px-5 pb-5 lg:px-6 lg:pb-5"
                          >
                            {faq.a}
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

      {/* ══ FINAL CTA ══ */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0 }}>
          <ImageWithFallback
            src={IMG_TEXTURE}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.18) saturate(0.6)" }}
          />
        </div>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(26,22,18,0.92) 0%, rgba(45,36,32,0.85) 100%)",
        }} />

        {/* Decorative ring */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480, height: 480, borderRadius: "50%",
          border: `1px solid rgba(196,149,106,0.12)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300, height: 300, borderRadius: "50%",
          border: `1px solid #C4956A14`,
          pointerEvents: "none",
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: 680, margin: "0 auto",
          textAlign: "center",
        }}
          className="px-6 py-16 lg:px-12 lg:py-[clamp(72px,12vw,128px)]"
        >
          <FadeIn>
            <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "24px" }}>
              Próximo passo
            </p>

            <h2 style={{
              fontFamily: "var(--font-serif)",
              color: "#fff",
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              lineHeight: 1.1,
              marginBottom: "24px",
            }}>
              Pronto para encontrar<br />
              <em style={{ color: GOLD }}>a sua voz artística?</em>
            </h2>

            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.95rem", lineHeight: 1.8,
              marginBottom: "48px",
              maxWidth: 500, margin: "0 auto 48px",
            }}>
              A sessão de diagnóstico é gratuita e sem compromisso. É apenas
              uma conversa — para perceber juntos onde está e onde quer chegar.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link
                to="/contactos"
                className="w-full sm:w-auto"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                  background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                  color: "#fff",
                  padding: "16px 36px",
                  fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase",
                  textDecoration: "none",
                  minHeight: 52,
                  boxShadow: "0 4px 20px rgba(201,169,110,0.3)",
                  transition: "opacity 0.3s",
                }}
                onMouseOver={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseOut={e => (e.currentTarget.style.opacity = "1")}
              >
                Contactar o Atelier
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/galeria"
                className="w-full sm:w-auto"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  color: "rgba(255,255,255,0.5)",
                  padding: "15px 24px",
                  fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.12)",
                  minHeight: 52,
                  transition: "all 0.3s",
                }}
                onMouseOver={e => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                }}
                onMouseOut={e => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              >
                Ver Galeria
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* Social proof */}
            <div style={{
              marginTop: "56px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "24px",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", gap: "-8px" }}>
                {["J", "C", "M", "R", "T"].map((init, idx) => (
                  <div key={idx} style={{
                    width: 32, height: 32,
                    border: `2px solid rgba(26,22,18,0.8)`,
                    borderRadius: "50%",
                    background: `hsl(${30 + idx * 15}, 35%, ${40 + idx * 5}%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginLeft: idx > 0 ? -8 : 0,
                    zIndex: 5 - idx,
                    position: "relative",
                  }}>
                    <span style={{ fontSize: "0.65rem", color: "#fff", fontFamily: "var(--font-serif)" }}>{init}</span>
                  </div>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                Mais de <span style={{ color: GOLD }}>50 artistas</span> já passaram pelo atelier
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Spacer for sticky CTA on mobile */}
      <div className="h-20 md:hidden" />

      {/* ══ STICKY MOBILE CTA ══ */}
      <div
        className="fixed bottom-0 left-0 right-0 md:hidden"
        style={{
          zIndex: 50,
          padding: "12px 24px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, rgba(250,247,242,0.98) 60%, rgba(250,247,242,0) 100%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          to="/contactos"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            minHeight: 52,
            background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
            color: "#fff",
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            textDecoration: "none",
            boxShadow: "0 -2px 20px rgba(201,169,110,0.25), 0 4px 16px rgba(0,0,0,0.1)",
          }}
        >
          Marcar Sessão Gratuita
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
