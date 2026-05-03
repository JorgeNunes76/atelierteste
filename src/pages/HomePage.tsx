import image_5e6eb64a41281458609227fd07658963b447aa31 from 'figma:asset/5e6eb64a41281458609227fd07658963b447aa31.png'
import image_647362d01162297203a407c70c1a4e77cf57a719 from 'figma:asset/647362d01162297203a407c70c1a4e77cf57a719.png'
import image_aa31aa09cda51a3c67f8269dc5d7f355182d82ed from 'figma:asset/aa31aa09cda51a3c67f8269dc5d7f355182d82ed.png'
import image_0d7fde90ec48230c3808e9b6ceed02fefe8e4a0f from 'figma:asset/0d7fde90ec48230c3808e9b6ceed02fefe8e4a0f.png'
import image_8b799b9061113d500f7cda6a170d147e2226ecaf from 'figma:asset/8b799b9061113d500f7cda6a170d147e2226ecaf.png'
import image_cd5e5be9bbc847f612d6eee464133e65f8dd8c6f from 'figma:asset/cd5e5be9bbc847f612d6eee464133e65f8dd8c6f.png'
import image_e3ebd450bf669425543eab28f6d0c6bbe28bea85 from 'figma:asset/e3ebd450bf669425543eab28f6d0c6bbe28bea85.png'
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { FadeIn } from "../app/components/FadeIn";
import { ImageWithFallback } from "../app/components/ui/ImageWithFallback";
import { getConfigAll } from "../lib/db";
import { buildSiteContentFromConfigs, SITE_CONTENT_DEFAULTS } from "../lib/siteContent";
import { GOLD } from "../lib/tokens";

const ExposicoesMap = lazy(() => import("../app/components/ExposicoesMap").then((m) => ({ default: m.ExposicoesMap })));
const CurvedCarousel = lazy(() => import("../app/components/CurvedCarousel").then((m) => ({ default: m.CurvedCarousel })));

// ── Default Configs (Fallback) ──────────────────────────────────────────────────
const DEFAULT_CONFIGS = {
  hero_titulo: "O Silêncio da Cor",
  hero_subtitulo: "Investigação artística e prática contemporânea nas artes plásticas e pintura — Obras originais criadas no coração de Portugal",
  hero_imagem: "/hero-principal.jpg",
  bio_texto: "Artista Plástica focada na exploração da luz, da cor e da forma, em diálogo com a matéria visual.",
  bio_imagem: "https://images.unsplash.com/photo-1764032760214-bbf340016105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  gallery_wall_imagem: "/gallery-wall.jpg",
  process_imagem: "/paint-detail.jpg"
};

// ── Constants ──────────────────────────────────────────────────
const IMG_PROCESS = "/paint-detail.jpg";
const IMG_GALLERY_WALL = "/gallery-wall.jpg";
const IMG_PORTRAIT = "https://images.unsplash.com/photo-1764032760214-bbf340016105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_WARM = "https://images.unsplash.com/photo-1638888077595-039e77b1dc70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const IMG_WORKSHOP = "/paint-detail.jpg";

const FEATURED_WORKS = [
  {
    id: 1,
    title: "Sem Título I",
    technique: "Acrílico sobre Tela",
    dimensions: "100×80cm",
    year: "2025",
    price: 1200,
    status: "Disponível",
    image: "https://images.unsplash.com/photo-1654716246527-385302b3ad47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    aspect: 1.25,
  },
  {
    id: 2,
    title: "Sem Título II",
    technique: "Óleo sobre Tela",
    dimensions: "120×100cm",
    year: "2024",
    price: 1800,
    status: "Disponível",
    image:
      "https://images.unsplash.com/photo-1662124530117-7774f635f9f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    aspect: 1.0,
  },
  {
    id: 3,
    title: "Sem Título III",
    technique: "Técnica Mista",
    dimensions: "80×60cm",
    year: "2024",
    price: 900,
    status: "Reservado",
    image:
      "https://images.unsplash.com/photo-1566153509056-c1d1a75078a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    aspect: 1.0,
  },
  {
    id: 4,
    title: "Fragmento IV",
    technique: "Acrílico e Resina",
    dimensions: "150×120cm",
    year: "2023",
    price: 2400,
    status: "Disponível",
    image:
      "https://images.unsplash.com/photo-1635141849017-c531949fb5b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    aspect: 0.9,
  },
];

const COLLECTIONS = [
  {
    id: "acervo",
    label: "Acervo Principal",
    count: "Obras Únicas",
    desc: "Pinturas originas de grande formato em óleo e acrílico.",
    image: IMG_GALLERY_WALL,
  },
  {
    id: "series",
    label: "Séries Temáticas",
    count: "Coleções",
    desc: "Explorações artísticas em conjuntos narrativos coerentes.",
    image: IMG_WARM,
  },
  {
    id: "drawing",
    label: "Desenhos & Estudos",
    count: "Papel & Esboços",
    desc: "Obras sobre papel, grafite e carvão — a génese da cor.",
    image: IMG_PROCESS,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "As obras de Ana Alexandre têm uma presença que transforma o espaço. A minha favorita domina a sala de estar há três anos e ainda me emociona.",
    name: "Dra. Margarida Fonseca",
    role: "Colecionadora · Lisboa",
  },
  {
    quote:
      "Comprei a primeira peça em 2019 e hoje tenho seis. Cada uma conta uma história diferente, mas juntas formam um universo único e inconfundível.",
    name: "Eng. Rui Vasconcelos",
    role: "Colecionador · Porto",
  },
  {
    quote:
      "A qualidade das obras, o acompanhamento personalizado e a autenticidade da artista tornam cada aquisição numa experiência inesquecível.",
    name: "Isabel Monteiro",
    role: "Galerista · Coimbra",
  },
  {
    quote:
      "Artista tem uma linguagem abstrata autêntica e marcante. Cada tela conta algo diferente a quem observa.",
    name: "Rosário Costa Rosa",
    role: "Professora de Geografia - Paredes",
  },
  {
    quote:
      "Arte contemporânea com identidade própria. Pinturas cheias de energia e profundidade. Uma artista que comunica sem palavras. Com traços livres, intensos e cheios de expressão.",
    name: "Doutor Luís Freitas",
    role: "Oftalmologista - Sintra",
  },
  {
    quote:
      "As obras da Ana Alexandre deixam memórias.",
    name: "Pedro Bastos",
    role: "Professor de Português – Viana do Castelo ",
  },
  {
    quote:
      "Uma artista que se destaca pela originalidade. Talento evidente em cada composição. As cores e as formas em perfeita harmonia.",
    name: "Drª Fátima Santos ",
    role: "Colecionadora - Lisboa",
  },
  {
    quote:
      "A Ana Alexandre tem um talento único e inspirador. Cada pintura revela sensibilidade e expressão. Vou continuar a acompanhar o seu trabalho.",
    name: "Doutora Beatriz Elvas",
    role: "Médica - Coimbra",
  },
];

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Investigação",
    desc: "Cada obra nasce de um processo de pesquisa visual e emocional, que se desenvolve ao longo do tempo, podendo prolongar-se durante semanas, até que a forma, a cor e a luz encontrem o seu equilíbrio natural.",
  },
  {
    n: "02",
    title: "Gesto & Matéria",
    desc: `O diálogo entre gesto e matéria tende a aparecer de forma equilibrada entre controle e sensibilidade.

A geometria surge ordem, estrutura e precisão – linhas, formas e módulos organizados. No entanto, o gesto da artista interfere nessa ordem: pequenas variações, imperfeições, sobreposições ou ritmos criam uma tensão visual que impede a rigidez absoluta.

A matéria também ganha destaque: superfícies podem ser exploradas pela repetição de camadas, pela densidade das cores ou pela relação entre áreas vazias e preenchidas. Assim, a obra não é apenas “desenho geométrico”, mas um campo onde o material responde ao gesto.

Nesse tipo de linguagem, o abstrato não é a ausência de significado, mas uma forma de organização sensível do espaço, onde o gesto humano e a matéria física constroem juntos à experiência visual.`,
  },
  {
    n: "03",
    title: "Obra Final",
    desc: "Cada obra é acompanhada de certificado de autenticidade e embalagem museológica, garantindo a sua origem, autoria e proteção durante o transporte e o armazenamento, de acordo com padrões utilizados em contexto museológico.",
  },
];

// ── Artwork Card ───────────────────────────────────────────────
function ArtworkCard({
  work,
  size = "normal",
}: {
  work: (typeof FEATURED_WORKS)[0];
  size?: "hero" | "normal";
}) {
  const [hovered, setHovered] = useState(false);
  const isAvailable = work.status === "Disponível";

  return (
    <Link
      to={`/galeria/${work.id}`}
      className="block group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ textDecoration: "none" }}
    >
      {/* Frame / Mat */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(145deg, #d4cec4 0%, #e8e4dd 50%, #f2efe9 100%)",
          padding: size === "hero" ? "clamp(16px,2.5vw,32px)" : "clamp(12px,1.8vw,20px)",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Inner frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingBottom: `${work.aspect * 100}%`,
            boxShadow:
              "0 6px 28px rgba(0,0,0,0.22), inset 0 0 0 10px #ffffff, inset 0 0 0 12px " + GOLD + ", inset 0 0 0 13px rgba(0,0,0,0.1)",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <ImageWithFallback
            src={work.image as string}
            alt={work.title}
            priority={size === "hero"}
            sizes={size === "hero" ? "(max-width: 768px) 100vw, 42vw" : "(max-width: 768px) 100vw, 28vw"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 1.4s cubic-bezier(0.25,0.1,0.25,1)",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />

          {/* Hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "20px",
              zIndex: 2,
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.35s ease",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: size === "hero" ? "1.25rem" : "1rem",
                marginBottom: "4px",
              }}
            >
              {work.title}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.72rem", letterSpacing: "0.04em", marginBottom: "8px" }}>
              {work.technique} · {work.dimensions}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: GOLD, fontSize: "0.8rem" }}>
                {isAvailable ? `€${work.price.toLocaleString("pt-PT")}` : "Reservado"}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.62rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isAvailable ? "rgba(100,220,120,0.85)" : "rgba(255,255,255,0.35)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: isAvailable ? "#4CAF50" : "#888",
                    display: "inline-block",
                  }}
                />
                {work.status}
              </span>
            </div>
          </div>
        </div>

        {/* Status badge – always visible */}
        {!isAvailable && (
          <div
            style={{
              position: "absolute",
              top: size === "hero" ? 20 : 14,
              right: size === "hero" ? 20 : 14,
              background: "rgba(255,255,255,0.92)",
              color: GOLD,
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "4px 10px",
              zIndex: 3,
            }}
          >
            Reservado
          </div>
        )}
      </div>

      {/* Caption */}
      <div style={{ marginTop: "12px", paddingLeft: "2px" }}>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            color: "#1a1a1a",
            fontSize: size === "hero" ? "1.05rem" : "0.92rem",
            marginBottom: "3px",
            transition: "color 0.25s",
          }}
        >
          {work.title}
        </p>
        <p style={{ color: "#aaa", fontSize: "0.75rem", letterSpacing: "0.03em" }}>
          {work.year} · {work.technique}
        </p>
      </div>
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────
export function HomePage() {
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIGS);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showExposicoesMap, setShowExposicoesMap] = useState(false);
  const [showCurvedCarousel, setShowCurvedCarousel] = useState(false);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const exposicoesRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSiteConfig() {
      try {
        const configs = await getConfigAll();
        const safeContent = buildSiteContentFromConfigs(configs);
        setSiteConfig((prev) => ({
          ...prev,
          hero_titulo: safeContent.hero_titulo,
          hero_subtitulo: safeContent.hero_subtitulo,
          hero_imagem: safeContent.hero_imagem,
          bio_texto: safeContent.bio_texto,
          process_imagem: safeContent.process_imagem,
        }));
      } catch (error) {
        if (import.meta.env?.DEV) console.error("Failed to load site configurations:", error);
      }
    }
    loadSiteConfig();
  }, []);

  useEffect(() => {
    const targets = [
      { ref: exposicoesRef, activate: setShowExposicoesMap },
      { ref: carouselRef, activate: setShowCurvedCarousel },
    ];

    const observers = targets.map(({ ref, activate }) => {
      const element = ref.current;
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            activate(true);
            observer.disconnect();
          }
        },
        { rootMargin: "400px 0px" },
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  // Track scroll position to update active dot
  const handleTestimonialScroll = useCallback(() => {
    const el = testimonialRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / TESTIMONIALS.length;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveTestimonial(Math.min(index, TESTIMONIALS.length - 1));
  }, []);

  // Scroll to a specific testimonial
  const scrollToTestimonial = useCallback((index: number) => {
    const el = testimonialRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / TESTIMONIALS.length;
    el.scrollTo({ left: cardWidth * index, behavior: "smooth" });
  }, []);

  const heroWords = siteConfig.hero_titulo.trim().split(/\s+/).filter(Boolean);
  const heroHeadlineMain = heroWords.length > 2 ? heroWords.slice(0, 2).join(" ") : (heroWords[0] || "");
  const heroHeadlineAccent = heroWords.length > 2 ? heroWords.slice(2).join(" ") : heroWords.slice(1).join(" ");

  return (
    <div className="bg-[#fafaf8]" style={{ position: 'relative' }}>
      {/* Marquee keyframes */}
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-inner { animation: marqueeScroll 28s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ══════════════ 1 · HERO EDITORIAL SPLIT ═════════════ */}
      <section
        style={{ minHeight: 560 }}
        className="flex flex-col lg:flex-row lg:min-h-[100svh]"
      >
        {/* Left — dark editorial panel */}
        <div
          className="order-2 lg:order-1 lg:w-[42%] px-5 py-10 sm:px-10 md:px-16 lg:px-20 lg:py-0"
          style={{
            background: "#FAF8F5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Decorative vertical line — desktop only */}
          <div
            className="hidden lg:block"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "clamp(20px,3.5vw,48px)",
              width: 1,
              background:
                "linear-gradient(to bottom, transparent, rgba(196,149,106,0.3) 25%, rgba(196,149,106,0.3) 75%, transparent)",
            }}
          />

          {/* Second decorative circle — desktop only */}
          <div
            className="hidden lg:block"
            style={{
              position: "absolute",
              top: "-10%",
              right: "10%",
              width: "clamp(100px,20vw,200px)",
              height: "clamp(100px,20vw,200px)",
              borderRadius: "50%",
              border: "1px solid rgba(196,149,106,0.07)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Label */}
            <p
              style={{
                fontSize: "0.55rem",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: GOLD,
                marginBottom: "16px",
              }}
            >
              Atelier Ana Alexandre · Tomar
            </p>

            {/* Headline */}
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                color: "#1A1A1A",
                fontSize: "clamp(1.75rem,5.5vw,4.5rem)",
                lineHeight: 1.05,
                marginBottom: "16px",
              }}
            >
              {heroHeadlineMain}
              <br />
              {heroHeadlineAccent ? <em style={{ color: GOLD }}>{heroHeadlineAccent}</em> : null}
            </h1>

            {/* Horizontal rule */}
            <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.5, marginBottom: "16px" }} />

            {/* Subline */}
            <p
              style={{
                color: "rgba(26,26,26,0.52)",
                fontSize: "1rem",
                lineHeight: 1.75,
                maxWidth: 320,
                marginBottom: "clamp(28px,5vw,48px)",
                letterSpacing: "0.02em",
              }}
            >
              {siteConfig.hero_subtitulo}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
              <Link
                to="/galeria"
                className="flex items-center justify-center sm:inline-flex gap-2.5 active:scale-[0.97] transition-transform"
                style={{
                  background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                  color: "#fff",
                  padding: "16px 30px",
                  fontSize: "0.68rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase" as const,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(201,169,110,0.3)",
                  minHeight: "52px",
                }}
                onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(201,169,110,0.45)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,169,110,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Explorar Obras
                <ArrowRight size={13} />
              </Link>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{ position: "relative", overflow: "hidden" }}
              >
                <Link
                  to="/sobre"
                  className="flex items-center justify-center sm:inline-flex gap-2.5 group"
                  style={{
                    position: "relative",
                    border: "1px solid rgba(196,149,106,0.45)",
                    color: "#1A1A1A",
                    padding: "15px 28px",
                    fontSize: "0.68rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    minHeight: "52px",
                    overflow: "hidden",
                    transition: "color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = GOLD;
                    e.currentTarget.style.color = GOLD;
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(201,169,110,0.18), inset 0 0 0 1px rgba(201,169,110,0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "rgba(196,149,106,0.45)";
                    e.currentTarget.style.color = "#1A1A1A";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Shimmer sweep on hover */}
                  <span
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(201,169,110,0.08) 40%, rgba(201,169,110,0.15) 50%, rgba(201,169,110,0.08) 60%, transparent 100%)",
                    }}
                  />
                  {/* Subtle gold fill from left on hover */}
                  <span
                    className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out pointer-events-none"
                    style={{
                      background: "rgba(196,149,106,0.06)",
                    }}
                  />
                  <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    A Artista
                    <motion.span
                      style={{ display: "inline-flex" }}
                      whileHover={{ x: 3 }}
                    >
                      <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "clamp(20px,4vw,40px)",
                marginTop: "clamp(36px,6vw,60px)",
                borderTop: "1px solid rgba(196,149,106,0.2)",
                paddingTop: "clamp(20px,3vw,32px)",
              }}
            >
              {[
                { n: "+400", l: "Obras" },
                { n: "+30", l: "Anos" },
                { n: "8", l: "Países" },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p style={{ fontFamily: "var(--font-serif)", color: GOLD, fontSize: "clamp(1.3rem,2.5vw,1.8rem)", lineHeight: 1 }}>
                    {n}
                  </p>
                  <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(26,26,26,0.38)", marginTop: 4 }}>
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right — image */}
        <div
          className="order-1 lg:order-2"
          style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 380 }}
        >
          {/* Mobile: contained 3:4 portrait with floating shadow */}
          <div className="block lg:hidden px-5 pt-4 pb-2" style={{ minHeight: 360 }}>
            <motion.div
              initial={{ scale: 1.04, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(201,169,110,0.06)",
                aspectRatio: "1.0",
              }}
            >
              <img
                src={siteConfig.hero_imagem}
                alt="Obra em destaque"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)",
                  borderRadius: 16,
                }}
              />
            </motion.div>
          </div>

          {/* Desktop: full-bleed absolute fill */}
          <div className="hidden lg:block" style={{ position: "absolute", inset: 0, padding: "clamp(12px,2vw,24px)" }}>
            <motion.div
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                position: "absolute",
                inset: "clamp(12px,2vw,24px)",
                borderRadius: "16px",
                overflow: "hidden",
                aspectRatio: "1.0",
                width: "min(100%, 80vh)",
                margin: "auto",
                boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(201,169,110,0.08)",
              }}
            >
              <img
                src={siteConfig.hero_imagem}
                alt="Obra em destaque"
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {/* Gradient overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to right, rgba(26,21,16,0.45) 0%, transparent 40%), linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)",
                  borderRadius: "16px",
                }}
              />
            </motion.div>

            {/* Vertical year label */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "clamp(12px,2.5vw,24px)",
                transform: "translateY(-50%) rotate(90deg)",
                fontSize: "0.52rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                transformOrigin: "center",
                whiteSpace: "nowrap",
              }}
            >
              Coleção 2025
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              style={{
                position: "absolute",
                bottom: "clamp(20px,4vw,36px)",
                right: "clamp(20px,4vw,40px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{ width: 1, height: 36, background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ 2 · OBRAS EM DESTAQUE ══════════════ */}
      <section className="px-5 sm:px-7 md:px-10 lg:px-0" style={{ paddingTop: "clamp(64px,10vw,120px)", paddingBottom: "clamp(64px,10vw,120px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }} className="lg:px-[72px]">

          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "clamp(32px,5vw,56px)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              paddingBottom: "20px",
            }}
          >
            <FadeIn>
              <div>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "8px" }}>
                  Coleção
                </p>
                <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", margin: 0 }}>
                  Obras em Destaque
                </h2>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Link
                to="/galeria"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  color: GOLD,
                  fontSize: "0.68rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "opacity 0.3s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = "0.65")}
                onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Ver Coleção Completa
                <ArrowUpRight size={14} />
              </Link>
            </FadeIn>
          </div>

          {/* Featured grid — large left + right stack */}
          <div
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10"
          >
            {/* Hero work */}
            <FadeIn>
              <ArtworkCard work={FEATURED_WORKS[0]} size="hero" />
            </FadeIn>

            {/* Right: 2 stacked works */}
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,40px)" }}>
              <FadeIn delay={0.1}>
                <ArtworkCard work={FEATURED_WORKS[1]} />
              </FadeIn>
              <FadeIn delay={0.18}>
                <ArtworkCard work={FEATURED_WORKS[2]} />
              </FadeIn>
            </div>
          </div>

          {/* Bottom row — third work + editorial text */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 lg:gap-10 mt-6 lg:mt-10">
            <FadeIn delay={0.1}>
              <ArtworkCard work={FEATURED_WORKS[3]} />
            </FadeIn>

            {/* Editorial panel */}
            <FadeIn delay={0.18}>
              <div
                style={{
                  background: "#FAF8F5",
                  border: "1px solid rgba(196,149,106,0.15)",
                  padding: "clamp(32px,5vw,56px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 240,
                }}
              >
                <div>
                  <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "20px" }}>
                    Sobre as Obras
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "#1A1A1A",
                      fontSize: "clamp(1.1rem,2vw,1.5rem)",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Cada obra é acompanhada de certificado de autenticidade e embalagem museológica.
                  </p>
                  <p style={{ color: "rgba(26,26,26,0.5)", fontSize: "0.84rem", lineHeight: 1.7, maxWidth: 380 }}>
                    Entregas em todo o país. Portugal Continental, Ilhas e Europa.
                    Consulte as condições de envio e devolução do Atelier.

                  </p>
                </div>
                <Link
                  to="/galeria"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    border: "1px solid rgba(196,149,106,0.35)",
                    color: GOLD,
                    padding: "13px 24px",
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    alignSelf: "flex-start",
                    marginTop: "clamp(24px,4vw,40px)",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = GOLD;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = GOLD;
                  }}
                >
                  Ver Todas as Obras
                  <ArrowRight size={13} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════ 3 · TESTEMUNHOS ══════════════ */}
      <section className="px-5 sm:px-7 md:px-10 lg:px-0" style={{ background: "#FAF8F5", paddingTop: "clamp(64px,10vw,160px)", paddingBottom: "clamp(64px,10vw,160px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }} className="lg:px-[72px]">
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "clamp(40px,6vw,64px)" }}>
              <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
                Testemunhos
              </p>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", margin: 0 }}>
                O Que Dizem os Colecionadores
              </h2>
            </div>
          </FadeIn>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid grid-cols-3 gap-8 lg:gap-10">
            {TESTIMONIALS.map(({ quote, name, role }, i) => (
              <FadeIn key={name} delay={i * 0.1}>
                <div
                  style={{
                    background: "#fff",
                    padding: "clamp(32px,4vw,48px)",
                    position: "relative",
                    borderRadius: "16px",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                    border: "1px solid rgba(201,169,110,0.08)",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, left: "clamp(20px,4vw,32px)", width: 24, height: 2, background: GOLD }} />
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "3.5rem", color: GOLD, opacity: 0.2, lineHeight: 0.8, marginBottom: "16px", letterSpacing: "-0.02em" }}>&ldquo;</p>
                  <p style={{ fontFamily: "var(--font-serif)", color: "#333", fontSize: "clamp(0.88rem,1.3vw,1rem)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "24px" }}>{quote}</p>
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "16px" }}>
                    <p style={{ color: "#1a1a1a", fontSize: "0.8rem" }}>{name}</p>
                    <p style={{ color: "#bbb", fontSize: "0.7rem", letterSpacing: "0.05em", marginTop: "2px" }}>{role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Mobile: horizontal snap carousel */}
          <div className="md:hidden">
            <div
              ref={testimonialRef}
              onScroll={handleTestimonialScroll}
              className="-mx-5 hide-scrollbar"
              style={{
                display: "flex",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                paddingLeft: 20,
                paddingRight: 20,
                gap: 16,
              }}
            >
              {TESTIMONIALS.map(({ quote, name, role }, i) => (
                <div
                  key={name}
                  className="testimonial-scroll"
                  style={{
                    scrollSnapAlign: "center",
                    flexShrink: 0,
                    width: "calc(100vw - 56px)",
                    maxWidth: 340,
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      padding: "28px 24px",
                      position: "relative",
                      borderRadius: "16px",
                      boxShadow: "0 8px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
                      border: "1px solid rgba(201,169,110,0.08)",
                      height: "100%",
                    }}
                  >
                    {/* Gold ornament */}
                    <div style={{ position: "absolute", top: 0, left: 24, width: 24, height: 2, background: GOLD }} />
                    {/* Quote mark */}
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: "2.8rem", color: GOLD, opacity: 0.2, lineHeight: 0.8, marginBottom: "12px", letterSpacing: "-0.02em" }}>&ldquo;</p>
                    <p style={{ fontFamily: "var(--font-serif)", color: "#333", fontSize: "0.95rem", lineHeight: 1.7, fontStyle: "italic", marginBottom: "20px" }}>{quote}</p>
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: "14px" }}>
                      <p style={{ color: "#1a1a1a", fontSize: "0.85rem" }}>{name}</p>
                      <p style={{ color: "#bbb", fontSize: "0.72rem", letterSpacing: "0.05em", marginTop: "2px" }}>{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToTestimonial(i)}
                  aria-label={`Testemunho ${i + 1}`}
                  style={{
                    width: activeTestimonial === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: activeTestimonial === i ? GOLD : "rgba(201,169,110,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: 0,
                    minHeight: "auto",
                    minWidth: "auto",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 4 · O ATELIER — PROCESSO ═════════════ */}
      <section className="px-5 sm:px-7 md:px-10 lg:px-0" style={{ background: "#fafaf8", paddingTop: "clamp(64px,10vw,140px)", paddingBottom: "clamp(64px,10vw,140px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }} className="lg:px-[72px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left: Images staggered */}
            <FadeIn direction="left">
              <div style={{ position: "relative" }}>
                {/* Main image */}
                <div style={{ overflow: "hidden", borderRadius: "16px", boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)" }}>
                  <img
                    src={siteConfig.process_imagem}
                    alt="O processo criativo"
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                  />
                </div>
                {/* Inset secondary image */}
                {/* Gold badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "-20px",
                    width: 72,
                    height: 72,
                    background: GOLD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                  className="hidden md:flex"
                >
                  <p style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "1.2rem", lineHeight: 1 }}>+30</p>
                  <p style={{ fontSize: "0.45rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>anos</p>
                </div>
              </div>
            </FadeIn>

            {/* Right: Text */}
            <FadeIn direction="right" delay={0.15}>
              <div>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "16px" }}>
                  O Atelier
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#1a1a1a",
                    fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                    lineHeight: 1.1,
                    marginBottom: "clamp(20px,3vw,32px)",
                  }}
                >
                  Como Nasce<br />
                  <em style={{ color: GOLD }}>uma Obra</em>
                </h2>
                <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "clamp(28px,4vw,40px)", maxWidth: 440 }}>
                  {siteConfig.bio_texto}
                </p>

                {/* Process steps */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {PROCESS_STEPS.map(({ n, title, desc }, i) => (
                    <div
                      key={n}
                      style={{
                        display: "flex",
                        gap: "20px",
                        padding: "20px 0",
                        borderBottom: i < PROCESS_STEPS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: GOLD,
                          fontSize: "0.75rem",
                          letterSpacing: "0.08em",
                          minWidth: 28,
                          paddingTop: 2,
                          opacity: 0.7,
                        }}
                      >
                        {n}
                      </p>
                      <div>
                        <p style={{ color: "#1a1a1a", fontSize: "0.88rem", marginBottom: "4px" }}>{title}</p>
                        <p style={{ color: "#999", fontSize: "0.78rem", lineHeight: 1.6, whiteSpace: "pre-line", textAlign: "justify" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/sobre"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#1a1a1a",
                    fontSize: "0.68rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderBottom: "1px solid rgba(0,0,0,0.15)",
                    paddingBottom: "2px",
                    marginTop: "clamp(24px,4vw,40px)",
                    transition: "color 0.3s, border-color 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = GOLD;
                    e.currentTarget.style.borderColor = GOLD;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#1a1a1a";
                    e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)";
                  }}
                >
                  Conhecer a Artista <ArrowRight size={12} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════ 5 · MAPA DE EXPOSIÇÕES ══════════════ */}
      <div
        id="exposicoes"
        style={{ scrollMarginTop: 80 }}
        aria-label="Mapa interativo de exposições"
      >
        <div ref={exposicoesRef} style={{ minHeight: 960 }}>
          {showExposicoesMap ? (
            <Suspense fallback={<div style={{ minHeight: 960, background: "#faf8f5" }} />}>
              <ExposicoesMap />
            </Suspense>
          ) : (
            <div style={{ minHeight: 960, background: "#faf8f5" }} />
          )}
        </div>
      </div>

      {/* ══════════════ 6 · ORIENTAÇÃO CTA ══════════════ */}
      <section className="px-5 sm:px-7 md:px-10 lg:px-0" style={{ position: "relative", background: "#fafaf8", paddingTop: "clamp(64px,10vw,120px)", paddingBottom: "clamp(64px,10vw,120px)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }} className="lg:px-[72px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Image */}
            <FadeIn direction="left">
              <div style={{ position: "relative", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
                <img
                  src={image_5e6eb64a41281458609227fd07658963b447aa31}
                  alt="Aulas de Pintura"
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover" }}
                />
                {/* Overlay badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    background: "rgba(196,149,106,0.92)",
                    padding: "12px 20px",
                  }}
                >
                  <p style={{ color: "#fff", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    Todos os Níveis
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Text */}
            <FadeIn direction="right" delay={0.15}>
              <div>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "16px" }}>
                  Formação
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#1a1a1a",
                    fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
                    lineHeight: 1.1,
                    marginBottom: "clamp(16px,3vw,24px)",
                  }}
                >
                  Aulas &amp;<br />
                  <em style={{ color: GOLD }}>Workshops</em>
                </h2>
                <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "clamp(20px,3vw,32px)", maxWidth: 420 }}>
                  Descubra o seu processo criativo através de sessões personalizadas no atelier em Tomar. Para todos os
                  níveis, desde iniciantes a artistas avançados.
                </p>
                <ul style={{ marginBottom: "clamp(24px,4vw,40px)", listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                  {["Aulas Individuais", "Workshops de Fim-de-semana", "Materiais Incluídos", "Certificado de Participação"].map(
                    (item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", color: "#555", fontSize: "0.88rem" }}>
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            border: `1px solid ${GOLD}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ width: 6, height: 6, background: GOLD, display: "block" }} />
                        </span>
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <Link
                  to="/orientacao"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    padding: "14px 28px",
                    fontSize: "0.68rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = GOLD;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = GOLD;
                  }}
                >
                  Saber Mais
                  <ArrowRight size={13} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════ 7 · SERVIÇOS — AS COLEÇÕES ══════════════ */}
      <section style={{ background: "#F5F0EB" }}>
        <div
          className="px-5 sm:px-7 md:px-10 lg:px-[72px]"
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            paddingTop: "clamp(64px,10vw,100px)",
            paddingBottom: "clamp(64px,10vw,100px)",
          }}
        >
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,56px)" }}>
              <p
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: GOLD,
                  marginBottom: "12px",
                }}
              >
                Coleções
              </p>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A", margin: 0, marginBottom: "12px" }}>
                As Coleções
              </h2>
              <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto" }} />
            </div>
          </FadeIn>

          <div ref={carouselRef} style={{ minHeight: 460 }}>
            {showCurvedCarousel ? (
              <Suspense fallback={<div style={{ minHeight: 460 }} />}>
                <CurvedCarousel />
              </Suspense>
            ) : (
              <div style={{ minHeight: 460 }} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
