import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useCart } from "../lib/cart";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { FadeIn } from "../app/components/FadeIn";
import { ImageWithFallback } from "../app/components/ui/ImageWithFallback";
import useEmblaCarousel from "embla-carousel-react";
import { getObraBySlug, getObras } from "../lib/db";
import { useSEO } from "../lib/useSEO";
import { estadoMap, classifyTecnica } from "../lib/mappers";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Award,
  RotateCcw,
  Plus,
  Minus,
  Check,
  X,
  Shield,
  Truck,
  Heart,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const GOLD = "#C9A96E";
const GOLD_LIGHT = "#d4b87a";
const GOLD_DARK = "#b8944f";
const CHARCOAL = "#1a1a1a";
const WARM = "#FAF8F5";

// ─── Constants & Types ────────────────────────────────────────────────────────
const IMG_MACRO = "https://images.unsplash.com/photo-1600196342919-4ede1f4ff45f?q=80&w=1080";

type ObraReal = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  technique: string;
  support: string;
  dimensionsFormatted: string;
  year: string;
  edition: string;
  price: number;
  vatNote: string;
  status: string;
  categoryLabel: string;
  images: { id: string; src: string; label: string }[];
  narrative: { title: string; paragraphs: string[]; pullQuote: string };
  relatedIds: string[];
};

function mapObraToDetail(o: any): ObraReal {
  const { categoryLabel } = classifyTecnica(o.tecnica);
  const t = (o.tecnica || "").toLowerCase();

  return {
    id: o.id,
    slug: o.slug,
    title: o.titulo,
    artist: "Ana Alexandre",
    technique: o.tecnica,
    support: t.includes("tela") ? "Tela de algodão sobre chassis" : "Papel de arquivo 300g",
    dimensionsFormatted: o.dimensoes || "Dimensões sob consulta",
    year: o.ano?.toString() || "2024",
    edition: "Obra única",
    price: o.preco || 0,
    vatNote: "IVA incluído",
    status: estadoMap[o.estado] || o.estado,
    categoryLabel,
    images: [
      { id: "main", src: o.imagem_url || "", label: "Vista Frontal" },
      { id: "macro", src: IMG_MACRO, label: "Detalhe Textura" },
    ],
    narrative: {
      title: "Sobre esta obra",
      paragraphs: o.descricao ? o.descricao.split("\n\n") : ["Esta obra é uma peça única criada pela artista Ana Alexandre, explorando a materialidade e a luz através do seu gesto pictórico característico."],
      pullQuote: `"${o.titulo}"`,
    },
    relatedIds: []
  };
}

// ─── Gold shimmer keyframes (injected once) ────────────────────────────────────
const shimmerCSS = `
@keyframes obra-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes obra-pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.5); opacity: 0; }
}
`;

// ─── Accordion Item ────────────────────────────────────────────────────────────
function AccordionItem({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group/acc"
        style={{ minHeight: "60px", padding: "16px 0" }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: open ? `${GOLD}15` : "transparent",
              color: GOLD,
            }}
          >
            {icon}
          </div>
          <span
            className="text-[0.82rem] tracking-[0.03em] transition-colors duration-200"
            style={{ color: open ? CHARCOAL : "#666" }}
          >
            {title}
          </span>
        </div>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: open ? GOLD : "#ccc" }}
        >
          <Plus size={14} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 pl-[46px] text-[0.82rem] text-[#777] leading-[1.85]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: { id: string; src: string; label: string }[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: "rgba(10,10,10,0.96)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full transition-colors z-10"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <X size={20} color="#fff" />
      </button>

      {/* Counter */}
      <div className="absolute top-7 left-6 text-[0.7rem] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
        {activeIndex + 1} / {images.length}
      </div>

      {/* Label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[0.65rem] tracking-[0.25em] uppercase" style={{ color: GOLD }}>
        {images[activeIndex].label}
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronLeft size={22} color="#fff" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <ChevronRight size={22} color="#fff" />
          </button>
        </>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="w-[90vw] h-[80vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <ImageWithFallback
            src={images[activeIndex].src}
            alt={images[activeIndex].label}
            className="max-w-full max-h-full object-contain"
            priority
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ObraPage() {
  const { id } = useParams(); // id is the slug
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [artwork, setArtwork] = useState<ObraReal | null>(null);
  const [relatedArtworks, setRelatedArtworks] = useState<ObraReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [galleryRef, galleryApi] = useEmblaCarousel({ loop: true });
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      try {
        const obra = await getObraBySlug(id);
        if (obra) {
          const detail = mapObraToDetail(obra);
          setArtwork(detail);
          
          // Load related
          const all = await getObras();
          const related = all
            .filter(o => o.slug !== id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(mapObraToDetail);
          setRelatedArtworks(related);
        } else {
          setArtwork(null);
        }
      } catch (err) {
        if (import.meta.env?.DEV) console.error("Error loading artwork:", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  useEffect(() => {
    if (!galleryApi) return;
    const onSelect = () => setActiveImage(galleryApi.selectedScrollSnap());
    galleryApi.on("select", onSelect);
    return () => { galleryApi.off("select", onSelect); };
  }, [galleryApi]);

  const handleThumbnailClick = (index: number) => {
    setActiveImage(index);
    galleryApi?.scrollTo(index);
  };

  const handleLightboxPrev = useCallback(() => {
    if (!artwork) return;
    setActiveImage((prev) => (prev - 1 + artwork.images.length) % artwork.images.length);
  }, [artwork]);

  const handleLightboxNext = useCallback(() => {
    if (!artwork) return;
    setActiveImage((prev) => (prev + 1) % artwork.images.length);
  }, [artwork]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    setActiveImage(0);
    setLiked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: GOLD }} />
      <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[#aaa]">Carregando Obra...</p>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-[#fafaf8] flex flex-col items-center justify-center gap-4">
      <p className="text-[0.85rem] tracking-[0.1em] text-[#999]">Erro ao carregar obra.</p>
      <Link to="/galeria" className="text-[0.75rem] tracking-[0.15em] uppercase" style={{ color: GOLD }}>
        Voltar à Galeria
      </Link>
    </div>
  );

  if (!artwork) return <Navigate to="/galeria" />;

  const specs = [
    { label: "Técnica", value: artwork.technique },
    { label: "Suporte", value: artwork.support },
    { label: "Dimensões", value: artwork.dimensionsFormatted },
    { label: "Ano", value: artwork.year },
    { label: "Edição", value: artwork.edition },
  ];

  useSEO({
    title: artwork.title,
    description: artwork.narrative.paragraphs[0]?.slice(0, 220) || `${artwork.technique} · ${artwork.dimensionsFormatted} · ${artwork.year}`,
    image: artwork.images[0]?.src,
    url: `/galeria/${artwork.slug}`,
  });

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-[80px] md:pb-0">
      <style>{shimmerCSS}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={artwork.images}
            activeIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
            onPrev={handleLightboxPrev}
            onNext={handleLightboxNext}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          BREADCRUMB — floating above
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="px-5 md:px-12 pt-5 md:pt-8 max-w-[1440px] mx-auto relative z-10">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 text-[0.65rem] tracking-[0.14em] uppercase"
        >
          <Link
            to="/galeria"
            className="flex items-center gap-1.5 transition-all hover:opacity-60 group/back"
            style={{ color: "#aaa", minHeight: "44px" }}
          >
            <ArrowLeft size={13} className="transition-transform group-hover/back:-translate-x-0.5" />
            <span>Galeria</span>
          </Link>
          <span className="hidden sm:flex items-center gap-2 min-w-0">
            <span style={{ color: "#ddd" }}>/</span>
            <span style={{ color: GOLD }} className="flex-shrink-0">
              {artwork.categoryLabel}
            </span>
          </span>
        </motion.nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Immersive Gallery + Info Panel
      ══════════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative max-w-[1440px] mx-auto pt-2 md:pt-4 pb-0 md:pb-4 px-0 md:px-12" style={{ position: "relative" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-0 lg:gap-8 xl:gap-10">

          {/* ── Galeria de Imagens ─────────────────────────────────────── */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="lg:sticky lg:top-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:max-w-[560px] xl:max-w-[620px] lg:mx-auto"
            >
              {/* Imagem principal */}
              <div
                className="relative overflow-hidden md:rounded-2xl group cursor-zoom-in"
                style={{
                  background: "linear-gradient(160deg, #f0ece6 0%, #e8e3dc 50%, #f5f2ee 100%)",
                  aspectRatio: "4/5",
                  maxHeight: "min(72vh, 640px)",
                }}
                onClick={() => setLightboxOpen(true)}
              >
                {/* Embla swipe container */}
                <div ref={galleryRef} className="overflow-hidden h-full w-full">
                  <div className="flex h-full">
                    {artwork.images.map((img) => (
                      <div key={img.id} className="flex-shrink-0 w-full h-full">
                        <ImageWithFallback
                          src={img.src}
                          alt={`${artwork.title} — ${img.label}`}
                          className="w-full h-full object-contain transition-transform duration-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zoom hint overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(26,26,26,0.5)", backdropFilter: "blur(8px)" }}>
                    <ZoomIn size={20} color="#fff" />
                  </div>
                </div>

                {/* Label + contador  */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)", padding: "40px 20px 16px" }}
                >
                  <div className="flex items-end justify-between">
                    <span className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {artwork.images[activeImage].label}
                    </span>
                    <span className="text-[0.55rem] tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {activeImage + 1} / {artwork.images.length}
                    </span>
                  </div>
                </div>

                {/* Setas desktop */}
                {artwork.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); galleryApi?.scrollPrev(); }}
                      className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft size={18} style={{ color: CHARCOAL }} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); galleryApi?.scrollNext(); }}
                      className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight size={18} style={{ color: CHARCOAL }} />
                    </button>
                  </>
                )}

                {/* Dots — mobile */}
                {artwork.images.length > 1 && (
                  <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {artwork.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); handleThumbnailClick(i); }}
                        className="rounded-full transition-all duration-400"
                        style={{
                          width: i === activeImage ? "24px" : "6px",
                          height: "6px",
                          background: i === activeImage ? GOLD : "rgba(255,255,255,0.5)",
                        }}
                        aria-label={`Ver imagem ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Miniaturas — desktop */}
              <div className="hidden md:flex md:justify-start gap-2 mt-1">
                {artwork.images.map((img, index) => (
                  <motion.button
                    key={img.id}
                    onClick={() => handleThumbnailClick(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex-shrink-0 w-[72px] h-[72px] overflow-hidden rounded-lg transition-all duration-300"
                    style={{
                      outline: activeImage === index ? `2px solid ${GOLD}` : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                    title={img.label}
                  >
                    <ImageWithFallback src={img.src} alt={img.label} className="w-full h-full object-cover" />
                    {activeImage !== index && (
                      <div className="absolute inset-0 bg-white/40 transition-opacity hover:bg-white/20" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Miniaturas — mobile */}
              <div className="md:hidden flex gap-2.5 mt-1 px-5 overflow-x-auto pb-2 scrollbar-none">
                {artwork.images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => handleThumbnailClick(index)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="relative w-[50px] h-[50px] overflow-hidden rounded-lg transition-all duration-200"
                      style={{
                        outline: activeImage === index ? `2px solid ${GOLD}` : "2px solid transparent",
                        outlineOffset: "2px",
                      }}
                    >
                      <ImageWithFallback src={img.src} alt={img.label} className="w-full h-full object-cover" />
                      {activeImage !== index && <div className="absolute inset-0 bg-white/45" />}
                    </div>
                    <span
                      className="text-[0.48rem] tracking-[0.06em] uppercase text-center leading-tight"
                      style={{ color: activeImage === index ? GOLD : "#c0bdb8" }}
                    >
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Info Panel — Ficha + CTA ────────���────────────────────── */}
          <div className="px-5 md:px-0 mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col gap-5 lg:gap-4"
            >
              {/* Category + Status */}
              <div>
                <div className="flex items-center gap-3 mb-2.5 lg:mb-2">
                  <p className="text-[0.6rem] tracking-[0.35em] uppercase" style={{ color: GOLD }}>
                    {artwork.categoryLabel}
                  </p>
                  <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, ${GOLD}30, transparent)` }} />
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 text-[0.55rem] tracking-[0.18em] uppercase rounded-full"
                    style={{
                      background: artwork.status === "Disponível" ? `${GOLD}12` : "rgba(0,0,0,0.04)",
                      color: artwork.status === "Disponível" ? GOLD : "#999",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: artwork.status === "Disponível" ? "#4ade80" : "#ddd" }}
                    />
                    {artwork.status}
                  </span>
                </div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-1.5"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: CHARCOAL,
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {artwork.title}
                </motion.h1>
                <div className="flex items-center gap-2">
                  <p className="text-[0.85rem]" style={{ color: "#999" }}>
                    por{" "}
                    <Link to="/sobre" className="transition-all hover:opacity-70" style={{ color: CHARCOAL }}>
                      {artwork.artist}
                    </Link>
                  </p>
                  <span className="text-[0.75rem]" style={{ color: "#ccc" }}>·</span>
                  <span className="text-[0.75rem]" style={{ color: "#bbb" }}>{artwork.year}</span>
                </div>
              </div>

              {/* Divider with gold accent */}
              <div className="flex items-center gap-3 -my-0.5 lg:-my-1">
                <div className="w-6 h-[2px]" style={{ background: GOLD }} />
                <div className="flex-1 h-[1px]" style={{ background: "rgba(0,0,0,0.06)" }} />
              </div>

              {/* Ficha Técnica — Clean grid */}
              <div>
                <p className="text-[0.58rem] tracking-[0.3em] uppercase mb-3 lg:mb-2.5" style={{ color: GOLD }}>
                  Ficha Técnica
                </p>
                <div className="space-y-2.5 lg:space-y-2">
                  {specs.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="text-[0.6rem] tracking-[0.2em] uppercase flex-shrink-0" style={{ color: "#aaa" }}>
                        {s.label}
                      </span>
                      <span className="h-[1px] flex-1 min-w-[16px]" style={{ background: "rgba(0,0,0,0.05)" }} />
                      <span className="text-[0.8rem] text-right" style={{ color: "#444" }}>
                        {s.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ── Área Comercial — Dramatic CTA ─────────────────────── */}
              <motion.div
                ref={ctaRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="rounded-2xl p-5 lg:p-4 space-y-3"
                style={{
                  background: "linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%)",
                  border: `1px solid ${GOLD}20`,
                  boxShadow: "0 4px 24px rgba(201,169,110,0.08)",
                }}
              >
                {/* Preço */}
                {artwork.status === "Disponível" ? (
                  <div className="flex items-end justify-between">
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: CHARCOAL,
                          fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
                          lineHeight: 1,
                        }}
                      >
                        €{artwork.price.toLocaleString("pt-PT")}
                      </p>
                      <p className="text-[0.68rem] mt-1" style={{ color: "#bbb" }}>
                        {artwork.vatNote} · Envio incluído PT
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setLiked(!liked)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      style={{ background: liked ? `${GOLD}15` : "rgba(0,0,0,0.03)" }}
                    >
                      <Heart
                        size={18}
                        fill={liked ? GOLD : "none"}
                        color={liked ? GOLD : "#ccc"}
                        className="transition-colors"
                      />
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <p
                      style={{ fontFamily: "var(--font-serif)", color: "#999", fontSize: "1.3rem" }}
                    >
                      Obra Reservada
                    </p>
                    <p className="text-[0.68rem] mt-1" style={{ color: "#ccc" }}>
                      Contacte-nos para mais informações
                    </p>
                  </div>
                )}

                {/* CTA Buttons */}
                {artwork.status === "Disponível" ? (
                  <div className="flex flex-col gap-3">
                    {/* Primary CTA — Gold gradient with shimmer */}
                    <button
                      onClick={() => {
                        addItem({ id: artwork.id, titulo: artwork.title, tecnica: artwork.technique, dimensoes: artwork.dimensionsFormatted, preco: artwork.price, imagem_url: artwork.images[0].src });
                        navigate("/carrinho");
                      }}
                      className="relative w-full py-3.5 text-center text-white text-[0.72rem] tracking-[0.2em] uppercase rounded-xl overflow-hidden transition-all hover:shadow-lg active:scale-[0.98] group/cta"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 50%, ${GOLD_DARK} 100%)`,
                        boxShadow: `0 4px 16px ${GOLD}40`,
                      }}
                    >
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
                          backgroundSize: "200% 100%",
                          animation: "obra-shimmer 1.5s ease-in-out infinite",
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Adquirir esta Obra
                        <ArrowRight size={15} className="transition-transform group-hover/cta:translate-x-1" />
                      </span>
                    </button>

                    {/* Secondary CTA */}
                    <Link
                      to={`/contactos?obra=${encodeURIComponent(artwork.title)}`}
                      className="w-full py-3.5 text-center text-[0.7rem] tracking-[0.16em] uppercase rounded-xl border transition-all hover:border-[#C9A96E] hover:text-[#1a1a1a] active:scale-[0.98]"
                      style={{ borderColor: "rgba(0,0,0,0.1)", color: "#999" }}
                    >
                      Contactar o Atelier
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      disabled
                      className="w-full py-4 text-center text-[0.72rem] tracking-[0.18em] uppercase border rounded-xl cursor-not-allowed"
                      style={{ borderColor: "rgba(0,0,0,0.06)", color: "#ccc" }}
                    >
                      Obra Reservada
                    </button>
                    <Link
                      to={`/contactos?obra=${encodeURIComponent(artwork.title)}&interesse=lista`}
                      className="w-full py-3 text-center text-[0.7rem] tracking-[0.16em] uppercase transition-opacity hover:opacity-70"
                      style={{ color: GOLD }}
                    >
                      Entrar na Lista de Espera →
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* ── Trust Badges — Premium row ────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="grid grid-cols-3 gap-2"
              >
                {[
                  { icon: <Truck size={15} />, label: "Envio Seguro", sub: "PT & Europa" },
                  { icon: <Shield size={15} />, label: "Certificado", sub: "Autenticidade" },
                  { icon: <RotateCcw size={15} />, label: "14 Dias", sub: "Devolução" },
                ].map((b, i) => (
                  <motion.div
                    key={b.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1 + i * 0.08 }}
                    className="text-center py-3 lg:py-2.5 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.015)" }}
                  >
                    <div className="flex justify-center mb-1.5" style={{ color: GOLD }}>
                      {b.icon}
                    </div>
                    <p className="text-[0.6rem] tracking-[0.04em]" style={{ color: CHARCOAL }}>
                      {b.label}
                    </p>
                    <p className="text-[0.55rem]" style={{ color: "#bbb" }}>{b.sub}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PULL QUOTE — Cinematic full-width moment
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-20 overflow-hidden" style={{ background: CHARCOAL }}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${GOLD} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />

        {/* Gold accent lines */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${GOLD}40, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${GOLD}40, transparent)` }} />

        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center relative z-10">
          <FadeIn>
            <div className="flex justify-center mb-6">
              <div className="w-8 h-[2px]" style={{ background: GOLD }} />
            </div>
            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "clamp(1.5rem, 3.5vw, 2.4rem)",
                lineHeight: 1.35,
                fontStyle: "italic",
                letterSpacing: "-0.01em",
              }}
            >
              {artwork.narrative.pullQuote}
            </blockquote>
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-[1px]" style={{ background: GOLD }} />
                <span className="text-[0.6rem] tracking-[0.3em] uppercase" style={{ color: GOLD }}>
                  {artwork.artist}
                </span>
                <div className="w-6 h-[1px]" style={{ background: GOLD }} />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          NARRATIVE — Elegant storytelling
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-16" style={{ background: "#fff" }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-14">
            {/* Left label column */}
            <FadeIn>
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-[0.58rem] tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>
                  {artwork.narrative.title}
                </p>
                <div className="w-10 h-[2px] mb-4" style={{ background: GOLD }} />
                <p className="text-[0.78rem] leading-[1.7]" style={{ color: "#bbb" }}>
                  Leia sobre o processo criativo, a intenção e o significado por trás desta peça.
                </p>
              </div>
            </FadeIn>

            {/* Right content */}
            <FadeIn delay={0.15}>
              <div className="space-y-4 max-w-[640px]">
                {artwork.narrative.paragraphs.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-[0.9rem] md:text-[0.93rem] leading-[1.95]"
                    style={{ color: "#555" }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          LOGISTICS — Refined accordion
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-16" style={{ background: WARM }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-14">
            <FadeIn>
              <div>
                <p className="text-[0.58rem] tracking-[0.35em] uppercase mb-3" style={{ color: GOLD }}>
                  Informações
                </p>
                <div className="w-10 h-[2px]" style={{ background: GOLD }} />
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="max-w-[600px] w-full">
                <AccordionItem icon={<Truck size={15} />} title="Envio e Embalagem Museológica">
                  <p>
                    A obra é embalada com técnicas museológicas: papel acid-free,
                    espuma de polietileno de alta densidade e caixa de madeira
                    personalizada. O envio é realizado por transportadora
                    especializada em arte, com seguro de transporte incluído.
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      "Portugal Continental: envio incluído no preço",
                      "Ilhas e Europa: consultar portes no atelier",
                      "Entrega estimada: 5–10 dias úteis após confirmação",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionItem>

                <AccordionItem icon={<Award size={15} />} title="Certificado de Autenticidade">
                  <p>
                    Cada obra original é acompanhada de um certificado de
                    autenticidade assinado pela artista, com ficha técnica
                    completa, fotografia de alta resolução e número de registo
                    único no arquivo do atelier.
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      "Assinado e datado pela artista Ana Alexandre",
                      "Número de registo único no arquivo do atelier",
                      "Fotografia de alta resolução da obra incluída",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionItem>

                <AccordionItem icon={<RotateCcw size={15} />} title="Política de Devoluções">
                  <p>
                    Acreditamos que a arte deve surpreender no contexto real. Se
                    por algum motivo a obra não corresponder às suas expectativas,
                    pode devolvê-la no prazo de 14 dias após a recepção, sem
                    necessidade de justificação.
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {[
                      "14 dias para devolução após recepção",
                      "Reembolso total no método de pagamento original",
                      "A obra deve ser devolvida na embalagem original",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={12} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          RELATED WORKS — Editorial carousel
      ══════════════════════════════════════════════════════════════════════ */}
      {relatedArtworks.length > 0 && (
        <section className="py-14 md:py-18" style={{ background: "#fff" }}>
          <div className="max-w-[1440px] mx-auto">
            <FadeIn>
              <div className="flex items-end justify-between mb-8 md:mb-10 px-6 md:px-12">
                <div>
                  <p className="text-[0.58rem] tracking-[0.35em] uppercase mb-2" style={{ color: GOLD }}>
                    Da mesma coleção
                  </p>
                  <h3
                    className="text-[clamp(1.4rem,2.5vw,1.8rem)]"
                    style={{ fontFamily: "var(--font-serif)", color: CHARCOAL, lineHeight: 1.15 }}
                  >
                    Outras Obras
                  </h3>
                </div>
                <Link
                  to="/galeria"
                  className="hidden sm:flex items-center gap-2 text-[0.68rem] tracking-[0.14em] uppercase transition-all hover:gap-3 group/link"
                  style={{ color: GOLD }}
                >
                  Ver galeria
                  <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </FadeIn>

            {/* Embla drag-free */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-5 md:gap-8 pl-6 md:pl-12 pr-6 md:pr-12">
                {relatedArtworks.map((rel, i) => (
                  <FadeIn key={rel.id} delay={i * 0.08}>
                    <Link
                      to={`/galeria/${rel.id}`}
                      className="group block flex-shrink-0 w-[200px] sm:w-[240px] md:w-[320px]"
                    >
                      {/* Image container */}
                      <div
                        className="relative overflow-hidden aspect-[3/4] rounded-xl group-hover:shadow-xl transition-shadow duration-500"
                        style={{
                          background: "linear-gradient(160deg, #f0ece6, #e8e3dc)",
                        }}
                      >
                        <ImageWithFallback
                          src={rel.images[0].src}
                          alt={rel.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Quick info on hover */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-[0.65rem] tracking-[0.15em] uppercase" style={{ color: "rgba(255,255,255,0.8)" }}>
                            Ver obra →
                          </p>
                        </div>

                        {rel.status === "Reservado" && (
                          <div
                            className="absolute top-3 right-3 px-2.5 py-1 text-[0.5rem] tracking-[0.15em] uppercase rounded-full"
                            style={{ background: "rgba(255,255,255,0.92)", color: GOLD }}
                          >
                            Reservado
                          </div>
                        )}
                      </div>

                      <div className="mt-3.5">
                        <p className="text-[0.62rem] tracking-[0.04em] truncate" style={{ color: "#bbb" }}>
                          {rel.technique}
                        </p>
                        <h4
                          className="mb-1 text-[0.88rem] md:text-[0.95rem]"
                          style={{ fontFamily: "var(--font-serif)", color: CHARCOAL }}
                        >
                          {rel.title}
                        </h4>
                        <p className="text-[0.78rem]" style={{ color: GOLD }}>
                          {rel.status === "Disponível"
                            ? `€${rel.price.toLocaleString("pt-PT")}`
                            : "Reservado"}
                        </p>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>

            <p className="md:hidden text-center text-[0.55rem] tracking-[0.18em] uppercase mt-5" style={{ color: "#d0cdc8" }}>
              deslize para ver mais
            </p>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STICKY CTA — Mobile only
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderTop: `1px solid ${GOLD}20`,
              paddingBottom: "env(safe-area-inset-bottom, 8px)",
            }}
          >
            <div className="flex items-center gap-3 px-5 py-3">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="truncate text-[0.78rem] leading-tight"
                  style={{ fontFamily: "var(--font-serif)", color: CHARCOAL }}
                >
                  {artwork.title}
                </p>
                <p
                  className="text-[0.72rem] mt-0.5"
                  style={{ color: artwork.status === "Disponível" ? GOLD : "#aaa" }}
                >
                  {artwork.status === "Disponível"
                    ? `€${artwork.price.toLocaleString("pt-PT")}`
                    : "Reservado"}
                </p>
              </div>

              {/* CTA */}
              {artwork.status === "Disponível" ? (
                <button
                  onClick={() => {
                    addItem({ id: artwork.id, titulo: artwork.title, tecnica: artwork.technique, dimensoes: artwork.dimensionsFormatted, preco: artwork.price, imagem_url: artwork.images[0].src });
                    navigate("/carrinho");
                  }}
                  className="relative flex-shrink-0 px-6 py-3.5 text-white text-[0.68rem] tracking-[0.16em] uppercase rounded-xl overflow-hidden active:scale-95 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD_DARK})`,
                    boxShadow: `0 3px 12px ${GOLD}35`,
                  }}
                >
                  Adquirir
                </button>
              ) : (
                <Link
                  to={`/contactos?obra=${encodeURIComponent(artwork.title)}&interesse=lista`}
                  className="flex-shrink-0 px-5 py-3.5 text-[0.68rem] tracking-[0.12em] uppercase rounded-xl border transition-opacity active:opacity-70"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  Lista de Espera
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
