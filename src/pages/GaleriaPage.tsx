import image_0fb117f1894ee3a8ddb0d956bce777924e5e36c4 from 'figma:asset/0fb117f1894ee3a8ddb0d956bce777924e5e36c4.png'
import image_170c757da3ac42fa32a32a3cbf1f2416044743dd from 'figma:asset/170c757da3ac42fa32a32a3cbf1f2416044743dd.png'
import image_26fa80762b3bb676a93d34e2887e0e81b564bb76 from "figma:asset/26fa80762b3bb676a93d34e2887e0e81b564bb76.png";
import image_37ae076f9c70040c1e86be4bab8a3370e8023d9e from "figma:asset/37ae076f9c70040c1e86be4bab8a3370e8023d9e.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { getObras } from "../lib/db";
import { estadoMap, classifyTecnica } from "../lib/mappers";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { FadeIn } from "../app/components/FadeIn";
import { ImageWithFallback } from "../app/components/ui/ImageWithFallback";
import { ArtworkFilters, FilterState } from "../app/components/ArtworkFilters";
import {
  SlidersHorizontal,
  Grid3x3,
  LayoutList,
  Heart,
  Eye,
  ArrowRight,
  ArrowUpDown,
  Sparkles,
  Shield,
  Package,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ZoomIn,
  Check,
} from "lucide-react";

const GOLD = "#C9A96E";
const GOLD_LIGHT = "#d4aa82";

// ─── Hero images ────────────────────────────────────────────────────────────────
const HERO_GALLERY =
  "https://images.unsplash.com/photo-1559739790-1d316574ca31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhYnN0cmFjdCUyMGFydCUyMGdhbGxlcnklMjB3aGl0ZSUyMG1pbmltYWx8ZW58MXx8fHwxNzczMDU0Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_INTERIOR =
  "https://images.unsplash.com/photo-1770677350521-d5fdcbd74367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbnRlcmlvciUyMGRlc2lnbiUyMHBhaW50aW5nJTIwYXJ0d29yayUyMHdhbGx8ZW58MXx8fHwxNzczMDU0MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
const IMG_STUDIO =
  "https://images.unsplash.com/photo-1772311992748-57ec07ee2e05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3QlMjBzdHVkaW8lMjBjb250ZW1wb3JhcnklMjBjcmVhdGl2ZSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzMwNTQyNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// ─── Gallery artwork type ────────────────────────────────────────────────────────
interface GaleriaObra {
  id: string;
  title: string;
  technique: string;
  dimensions: string;
  year: string;
  price: number;
  status: string;
  category: string;
  techniqueType: string;
  size: string;
  dominantColor: string;
  theme: string;
  image: string;
  aspect: string;
  featured: boolean;
}

function mapObraToGaleria(o: {
  id: string; titulo: string; tecnica: string; dimensoes: string | null;
  ano: number | null; preco: number | null; estado: string;
  imagem_url: string | null; slug: string; destaque: boolean;
}): GaleriaObra {
  const { techniqueType, category } = classifyTecnica(o.tecnica);
  return {
    id: o.slug,
    title: o.titulo,
    technique: o.tecnica,
    dimensions: o.dimensoes || "",
    year: o.ano?.toString() || "",
    price: o.preco || 0,
    status: estadoMap[o.estado] || o.estado,
    category,
    techniqueType,
    size: "medium",
    dominantColor: "black",
    theme: "abstract",
    image: o.imagem_url || "",
    aspect: "3/4",
    featured: o.destaque,
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────────
const CATEGORIES_BASE = [
  { id: "all", label: "Todas" },
  { id: "acervo", label: "Obras Principais" },
  { id: "series", label: "Séries Temáticas" },
  { id: "drawing", label: "Desenhos & Estudos" },
];

// ─── Animated Counter ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ─── Artwork Card ───────────────────────────────────────────────────────────────
function ArtworkCard({
  work,
  index,
  viewMode,
  onQuickView,
}: {
  work: GaleriaObra;
  index: number;
  viewMode: "grid" | "list";
  onQuickView: (work: GaleriaObra) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  // If viewMode is list, we'll keep the existing list logic
  if (viewMode === "list") {
    return (
      <FadeIn delay={index * 0.04}>
        <Link
          to={`/galeria/${work.id}`}
          className="group flex gap-6 md:gap-10 py-6 border-b border-black/[0.06] items-center"
        >
          <div
            className="relative flex-shrink-0 w-[100px] h-[100px] md:w-[140px] md:h-[140px] overflow-hidden rounded-sm"
            style={{ background: "linear-gradient(145deg, #ede8e0, #f5f2ee)" }}
          >
            <ImageWithFallback
              src={work.image}
              alt={work.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100px, 140px"
            />
            {work.status === "Reservado" && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(250,250,248,0.7)" }}
              >
                <span
                  className="text-[0.6rem] tracking-[0.2em] uppercase px-2 py-1"
                  style={{ color: GOLD, background: "rgba(255,255,255,0.9)" }}
                >
                  Reservado
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[0.6rem] tracking-[0.25em] uppercase mb-1"
              style={{ color: GOLD }}
            >
              {work.year} · {work.technique}
            </p>
            <h3
              className="mb-1 truncate transition-colors group-hover:text-[#C4956A]"
              style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1.15rem" }}
            >
              {work.title}
            </h3>
            <p className="text-[0.8rem] text-[#999]">{work.dimensions}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p
              className="text-[1.1rem] mb-0.5"
              style={{ fontFamily: "var(--font-serif)", color: work.status === "Disponível" ? "#1a1a1a" : "#bbb" }}
            >
              {work.status === "Disponível" ? `€${work.price.toLocaleString("pt-PT")}` : "Reservado"}
            </p>
            <span
              className="inline-flex items-center gap-1 text-[0.7rem] transition-colors group-hover:text-[#C4956A]"
              style={{ color: "#bbb" }}
            >
              Ver obra <ArrowRight size={12} />
            </span>
          </div>
        </Link>
      </FadeIn>
    );
  }

  return (
    <FadeIn delay={index * 0.04}>
      <motion.div
        className="group relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        layout
      >
        <Link to={`/galeria/${work.id}`} className="block">
          {/* ── Mobile: Clean Nike-style card (no frame, edge-to-edge) ── */}
          <div className="md:hidden relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4", background: "#f0ece6" }}>
            <ImageWithFallback
              src={work.image}
              alt={work.title}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {/* Always-visible heart */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center z-10"
              style={{ background: liked ? GOLD : "rgba(255,255,255,0.88)", backdropFilter: "blur(10px)" }}
            >
              <Heart size={14} fill={liked ? "#fff" : "none"} style={{ color: liked ? "#fff" : "#777" }} />
            </button>
            {/* Status badge */}
            {work.status === "Reservado" && (
              <div className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[0.58rem] tracking-[0.1em] uppercase rounded-full z-10" style={{ background: "rgba(255,255,255,0.92)", color: GOLD, backdropFilter: "blur(10px)" }}>
                Reservado
              </div>
            )}
            {/* Bottom gradient with quick info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pt-12" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
              <p className="text-white/90 text-[0.82rem]" style={{ fontFamily: "var(--font-serif)" }}>
                {work.status === "Disponível" ? `€${work.price.toLocaleString("pt-PT")}` : ""}
              </p>
            </div>
          </div>

          {/* ── Desktop: Original frame card ── */}
          <div
            className="hidden md:block relative overflow-hidden rounded-sm"
            style={{
              aspectRatio: work.aspect,
              background: "linear-gradient(145deg, #d4cec4 0%, #e8e4dd 50%, #f2efe9 100%)",
              padding: "1.5rem",
              boxShadow: "0 12px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                boxShadow: "0 4px 20px rgba(0,0,0,0.15), inset 0 0 0 10px #ffffff, inset 0 0 0 12px #C4956A, inset 0 0 0 13px rgba(0,0,0,0.08)",
                background: "#ffffff",
                borderRadius: "1px",
              }}
            >
              <ImageWithFallback
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover transition-transform duration-[2.2s] ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
              
              {/* Shimmer Sweep Effect */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                initial={{ x: "-100%", opacity: 0 }}
                whileHover={{ x: "100%", opacity: 0.4 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                  width: "100%",
                  height: "100%"
                }}
              />

              <motion.div
                className="absolute inset-0 flex flex-col justify-between p-4 z-20"
                initial={false}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.4) 100%)",
                  pointerEvents: isHovered ? "auto" : "none",
                }}
              >
                <div className="flex justify-end gap-2">
                  <motion.button
                    initial={{ y: -10, opacity: 0 }}
                    animate={isHovered ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
                    transition={{ delay: 0.05 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
                    style={{ background: liked ? GOLD : "rgba(255,255,255,0.85)" }}
                  >
                    <Heart size={15} fill={liked ? "#fff" : "none"} style={{ color: liked ? "#fff" : "#666" }} />
                  </motion.button>
                  <motion.button
                    initial={{ y: -10, opacity: 0 }}
                    animate={isHovered ? { y: 0, opacity: 1 } : { y: -10, opacity: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(work); }}
                    className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.85)" }}
                  >
                    <ZoomIn size={15} style={{ color: "#666" }} />
                  </motion.button>
                </div>
                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={isHovered ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-white/70 text-[0.65rem] tracking-[0.15em] uppercase mb-1">{work.technique}</p>
                  <p className="text-white text-[0.85rem]" style={{ fontFamily: "var(--font-serif)" }}>Ver detalhes →</p>
                </motion.div>
              </motion.div>
            </div>
            {work.status === "Reservado" && (
              <div className="absolute top-5 left-5 px-3 py-1.5 text-[0.6rem] tracking-[0.18em] uppercase rounded-sm" style={{ background: "rgba(255,255,255,0.95)", color: GOLD }}>
                Reservado
              </div>
            )}
          </div>
        </Link>

        {/* Card info — Mobile: compact / Desktop: original */}
        <div className="mt-2 md:mt-4">
          <div className="md:hidden">
            <h3 className="text-[0.82rem] mb-0.5 truncate" style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}>{work.title}</h3>
            <p className="text-[0.68rem] text-[#999] truncate">{work.technique}</p>
          </div>
          <div className="hidden md:flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/galeria/${work.id}`}>
                <h3 className="text-[1rem] mb-0.5 truncate transition-colors hover:text-[#C4956A]" style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a" }}>{work.title}</h3>
              </Link>
              <p className="text-[0.75rem] text-[#aaa]">{work.technique} · {work.dimensions}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[0.95rem]" style={{ fontFamily: "var(--font-serif)", color: work.status === "Disponível" ? GOLD : "#bbb" }}>
                {work.status === "Disponível" ? `€${work.price.toLocaleString("pt-PT")}` : "—"}
              </p>
              <p className="text-[0.6rem] text-[#ccc] tracking-[0.08em] uppercase">{work.year}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────────
function ArtworkSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div className={`animate-pulse ${viewMode === "list" ? "flex gap-6 md:gap-10 py-6 border-b border-black/[0.06] items-center" : ""}`}>
      {viewMode === "list" ? (
        <>
          <div className="flex-shrink-0 w-[100px] h-[100px] md:w-[140px] md:h-[140px] bg-black/[0.05] rounded-sm" />
          <div className="flex-1">
            <div className="h-2 w-24 bg-black/[0.05] mb-4" />
            <div className="h-4 w-48 bg-black/[0.05] mb-2" />
            <div className="h-3 w-32 bg-black/[0.05]" />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-black/[0.05] rounded-sm" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-black/[0.05]" />
            <div className="h-3 w-1/2 bg-black/[0.05]" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick View Modal ───────────────────────────────────────────────────────────
function QuickViewModal({
  work,
  onClose,
}: {
  work: GaleriaObra | null;
  onClose: () => void;
}) {
  if (!work) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Mobile: Bottom sheet */}
      <motion.div
        className="relative bg-[#fafaf8] w-full md:max-w-4xl md:rounded-sm rounded-t-3xl md:rounded-t-sm overflow-hidden max-h-[92vh] md:max-h-[90vh] grid grid-cols-1 md:grid-cols-2"
        initial={{ y: "100%", scale: 1 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: "100%", scale: 1 }}
        transition={{ type: "spring", damping: 32, stiffness: 350 }}
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-black/10" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <X size={18} style={{ color: "#666" }} />
        </button>

        {/* Image */}
        <div className="aspect-[3/4] md:aspect-auto overflow-hidden">
          <ImageWithFallback
            src={work.image}
            alt={work.title}
            className="w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 520px"
          />
        </div>

        {/* Info */}
        <div className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p
              className="text-[0.6rem] tracking-[0.3em] uppercase mb-3"
              style={{ color: GOLD }}
            >
              {work.category === "acervo"
                ? "Obras Principais"
                : work.category === "series"
                ? "Séries Temáticas"
                : "Desenhos & Estudos"}
            </p>
            <h2
              className="mb-2"
              style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1.8rem" }}
            >
              {work.title}
            </h2>
            <p className="text-[0.85rem] text-[#888] mb-6">
              por{" "}
              <span className="text-[#1a1a1a]">Ana Alexandre</span>
            </p>

            <div className="space-y-3 mb-8">
              {[
                { label: "Técnica", value: work.technique },
                { label: "Dimensões", value: work.dimensions },
                { label: "Ano", value: work.year },
                { label: "Estado", value: work.status },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-black/[0.04]">
                  <span className="text-[0.75rem] text-[#999] tracking-[0.08em] uppercase">
                    {item.label}
                  </span>
                  <span className="text-[0.85rem] text-[#333]">{item.value}</span>
                </div>
              ))}
            </div>

            {work.status === "Disponível" && (
              <p
                className="mb-2"
                style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1.6rem" }}
              >
                €{work.price.toLocaleString("pt-PT")}
              </p>
            )}
            <p className="text-[0.7rem] text-[#bbb] mb-6">IVA incluído · Envio em Portugal Continental</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/galeria/${work.id}`}
              onClick={onClose}
              className="w-full py-3.5 text-center text-white text-[0.72rem] tracking-[0.18em] uppercase rounded-sm transition-opacity hover:opacity-85"
              style={{ background: GOLD }}
            >
              Ver Obra Completa
            </Link>
            {work.status === "Disponível" && (
              <Link
                to={`/contactos?obra=${encodeURIComponent(work.title)}`}
                onClick={onClose}
                className="w-full py-3.5 text-center text-[0.72rem] tracking-[0.18em] uppercase border rounded-sm transition-colors hover:text-[#1a1a1a]"
                style={{ borderColor: "rgba(0,0,0,0.12)", color: "#999" }}
              >
                Solicitar Informação
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Gallery Page ──────────────────────────────────────────────────────────
export function GaleriaPage() {
  const [artworks, setArtworks] = useState<GaleriaObra[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [quickViewWork, setQuickViewWork] = useState<GaleriaObra | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    techniques: [],
    sizes: [],
    colors: [],
    priceRange: [0, 5000],
    themes: [],
    availableOnly: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getObras().then((data) => {
      setArtworks((data as any[]).map(mapObraToGaleria));
      setLoading(false);
    });
  }, []);

  const categories = CATEGORIES_BASE.map((cat) => ({
    ...cat,
    count: cat.id === "all" ? artworks.length : artworks.filter((w) => w.category === cat.id).length,
  }));

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Featured artworks for the spotlight
  const featuredWorks = artworks.filter((w) => w.featured);

  const nextFeatured = useCallback(() => {
    setFeaturedIndex((prev) => (prev + 1) % featuredWorks.length);
  }, [featuredWorks.length]);

  const prevFeatured = useCallback(() => {
    setFeaturedIndex((prev) => (prev - 1 + featuredWorks.length) % featuredWorks.length);
  }, [featuredWorks.length]);

  // Auto rotate featured
  useEffect(() => {
    const timer = setInterval(nextFeatured, 6000);
    return () => clearInterval(timer);
  }, [nextFeatured]);

  // Apply filters
  let filtered =
    activeCategory === "all" ? artworks : artworks.filter((w) => w.category === activeCategory);

  filtered = filtered.filter((work) => {
    if (filters.techniques.length > 0 && !filters.techniques.includes(work.techniqueType))
      return false;
    if (filters.sizes.length > 0 && !filters.sizes.includes(work.size)) return false;
    if (filters.colors.length > 0 && !filters.colors.includes(work.dominantColor)) return false;
    if (work.price < filters.priceRange[0] || work.price > filters.priceRange[1]) return false;
    if (filters.themes.length > 0 && !filters.themes.includes(work.theme)) return false;
    if (filters.availableOnly && work.status !== "Disponível") return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return parseInt(b.year) - parseInt(a.year);
      case "oldest":
        return parseInt(a.year) - parseInt(b.year);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const availableCount = artworks.filter((w) => w.status === "Disponível").length;

  return (
    <div className="relative min-h-screen bg-[#fafaf8]">
      {/* ═══ SECTION 1 — Cinematic Hero ═══════════════════════════════════════ */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[55vh] md:min-h-[85vh]">
        {/* Background image with parallax */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <ImageWithFallback
            src={HERO_GALLERY}
            alt="Galeria contemporânea"
            className="w-full h-full object-cover"
            priority
            sizes="100vw"
            style={{ filter: "brightness(0.35) saturate(0.7)" }}
          />
          {/* Gold gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(196,149,106,0.15) 0%, transparent 50%, rgba(26,26,26,0.3) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 50%, rgba(250,250,248,1) 100%)",
            }}
          />
        </motion.div>

        <motion.div
          className="relative z-10 flex flex-col justify-center items-center text-center px-6 min-h-[55vh] md:min-h-[85vh]"
          style={{ opacity: heroOpacity, paddingTop: "8vh" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p
              className="text-[0.6rem] tracking-[0.5em] uppercase mb-6"
              style={{ color: GOLD_LIGHT }}
            >
              Atelier Ana Alexandre
            </p>
          </motion.div>

          <motion.h1
            className="mb-6 max-w-3xl"
            style={{
              fontFamily: "var(--font-serif)",
              color: "#fff",
              fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
              lineHeight: 1.05,
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Galeria de
            <br />
            <span style={{ color: GOLD_LIGHT }}>Arte Original</span>
          </motion.h1>

          <motion.p
            className="text-[0.95rem] max-w-lg mb-10 leading-[1.9]"
            style={{ color: "rgba(255,255,255,0.65)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Cada obra é uma peça única, acompanhada de certificado de autenticidade
            e embalagem museológica. Descubra a obra que transforma o seu espaço.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-8 md:gap-16 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {[
              { value: artworks.length, label: "Obras", suffix: "" },
              { value: availableCount, label: "Disponíveis", suffix: "" },
              { value: 3, label: "Anos de Criação", suffix: "" },
              { value: 100, label: "Autenticadas", suffix: "%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="mb-1"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: GOLD_LIGHT,
                    fontSize: "1.8rem",
                  }}
                >
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-[1px] h-12" style={{ background: `linear-gradient(180deg, ${GOLD}80, transparent)` }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SECTION 2 — Curadoria em Destaque ════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.35em] uppercase mb-3"
                  style={{ color: GOLD }}
                >
                  <Sparkles size={12} className="inline mr-2" style={{ verticalAlign: "-1px" }} />
                  Curadoria em Destaque
                </p>
                <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
                  Seleção do Atelier
                </h2>
              </div>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={prevFeatured}
                  className="w-11 h-11 rounded-full border border-black/[0.08] flex items-center justify-center transition-all hover:border-[#C4956A] hover:text-[#C4956A]"
                  style={{ color: "#bbb" }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextFeatured}
                  className="w-11 h-11 rounded-full border border-black/[0.08] flex items-center justify-center transition-all hover:border-[#C4956A] hover:text-[#C4956A]"
                  style={{ color: "#bbb" }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {featuredWorks.length === 0 ? null : <motion.div
              key={featuredIndex}
              className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8 lg:gap-16 items-center"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
            >
              {/* Featured image */}
              {featuredWorks[featuredIndex] && (
              <Link
                to={`/galeria/${featuredWorks[featuredIndex].id}`}
                className="group relative overflow-hidden rounded-sm block"
                style={{
                  aspectRatio: "3/4",
                  background: "linear-gradient(145deg, #d4cec4 0%, #e8e4dd 50%, #f2efe9 100%)",
                  padding: "clamp(1rem,4vw,2.5rem)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    boxShadow:
                      "0 6px 24px rgba(0,0,0,0.2), inset 0 0 0 12px #ffffff, inset 0 0 0 14px #C4956A",
                    background: "#f9f7f4",
                  }}
                >
                  <ImageWithFallback
                    src={featuredWorks[featuredIndex].image}
                    alt={featuredWorks[featuredIndex].title}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Progress dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {featuredWorks.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault();
                        setFeaturedIndex(i);
                      }}
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: i === featuredIndex ? "24px" : "6px",
                        height: "6px",
                        background: i === featuredIndex ? GOLD : "rgba(255,255,255,0.6)",
                      }}
                    />
                  ))}
                </div>
              </Link>
              )}

              {/* Featured info */}
              <div className="py-4">
                <p
                  className="text-[0.58rem] tracking-[0.35em] uppercase mb-4"
                  style={{ color: GOLD }}
                >
                  Obra em Destaque
                </p>
                <h2
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#1a1a1a",
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                    lineHeight: 1.1,
                  }}
                >
                  {featuredWorks[featuredIndex]?.title}
                </h2>
                <p className="text-[0.9rem] text-[#888] mb-8 leading-[1.9] max-w-md">
                  {featuredWorks[featuredIndex]?.technique} · {featuredWorks[featuredIndex]?.dimensions}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  {[
                    { label: "Técnica", value: featuredWorks[featuredIndex]?.technique },
                    { label: "Dimensões", value: featuredWorks[featuredIndex]?.dimensions },
                    { label: "Ano", value: featuredWorks[featuredIndex]?.year },
                    { label: "Estado", value: featuredWorks[featuredIndex]?.status },
                  ].map((spec) => (
                    <div key={spec.label} className="py-3 border-b border-black/[0.05]">
                      <p className="text-[0.58rem] tracking-[0.2em] uppercase text-[#c0bdb8] mb-1">
                        {spec.label}
                      </p>
                      <p className="text-[0.88rem] text-[#333]">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        color: "#1a1a1a",
                        fontSize: "2rem",
                      }}
                    >
                      €{featuredWorks[featuredIndex].price.toLocaleString("pt-PT")}
                    </p>
                    <p className="text-[0.7rem] text-[#bbb]">IVA incluído</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/galeria/${featuredWorks[featuredIndex].id}`}
                    className="px-8 py-4 text-center text-white text-[0.72rem] tracking-[0.18em] uppercase rounded-sm transition-opacity hover:opacity-85"
                    style={{ background: GOLD }}
                  >
                    Ver Obra Completa
                  </Link>
                  <Link
                    to={`/contactos?obra=${encodeURIComponent(featuredWorks[featuredIndex].title)}`}
                    className="px-8 py-4 text-center text-[0.72rem] tracking-[0.18em] uppercase border rounded-sm transition-colors hover:text-[#1a1a1a]"
                    style={{ borderColor: "rgba(0,0,0,0.12)", color: "#999" }}
                  >
                    Adquirir
                  </Link>
                </div>
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ SECTION 3 — Trust Badges / Value Props ═══════════════════════════ */}
      <section className="border-y border-black/[0.05] py-12 px-6 md:px-12" style={{ background: "rgba(196,149,106,0.03)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Award size={22} />,
                title: "Certificado de Autenticidade",
                desc: "Cada obra inclui certificação da artista",
              },
              {
                icon: <Package size={22} />,
                title: "Embalagem Museológica",
                desc: "Proteção profissional para envio seguro",
              },
              {
                icon: <Shield size={22} />,
                title: "Garantia de Qualidade",
                desc: "Materiais premium de arquivo permanente",
              },
              {
                icon: <Eye size={22} />,
                title: "Visita Privada",
                desc: "Agende para ver as obras pessoalmente",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="text-center md:text-left">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4"
                    style={{ background: "rgba(196,149,106,0.1)", color: GOLD }}
                  >
                    {item.icon}
                  </div>
                  <h4
                    className="text-[0.8rem] tracking-[0.04em] mb-1.5"
                    style={{ color: "#1a1a1a" }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-[0.75rem] text-[#aaa] leading-[1.7]">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — Collection Grid ═════════════════════════════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Section header */}
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.35em] uppercase mb-3"
                  style={{ color: GOLD }}
                >
                  Explorar Coleção
                </p>
                <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
                  Todas as Obras
                </h2>
              </div>

              {/* View toggles & filter trigger */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 text-[0.7rem] tracking-[0.1em] uppercase border rounded-sm transition-all"
                  style={{
                    borderColor: showFilters ? GOLD : "rgba(0,0,0,0.1)",
                    color: showFilters ? GOLD : "#999",
                    background: showFilters ? "rgba(196,149,106,0.06)" : "transparent",
                  }}
                >
                  <SlidersHorizontal size={14} />
                  Filtros
                </button>
                <div className="flex border border-black/[0.08] rounded-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className="px-3 py-2.5 transition-all"
                    style={{
                      background: viewMode === "grid" ? "#1a1a1a" : "transparent",
                      color: viewMode === "grid" ? "#fff" : "#bbb",
                    }}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className="px-3 py-2.5 transition-all"
                    style={{
                      background: viewMode === "list" ? "#1a1a1a" : "transparent",
                      color: viewMode === "list" ? "#fff" : "#bbb",
                    }}
                  >
                    <LayoutList size={16} />
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Category tabs */}
          <FadeIn>
            <div className="flex gap-2 md:gap-1 mb-8 md:mb-10 overflow-x-auto pb-2 hide-scrollbar" style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex-shrink-0 px-5 md:px-6 py-2.5 md:py-3 text-[0.72rem] tracking-[0.12em] uppercase rounded-full md:rounded-sm whitespace-nowrap relative overflow-hidden cursor-pointer"
                  style={{
                    scrollSnapAlign: "start",
                    background: "transparent",
                    color: activeCategory === cat.id ? "#fff" : "#888",
                    border: activeCategory === cat.id
                      ? "1px solid transparent"
                      : "1px solid rgba(201,169,110,0.2)",
                    zIndex: activeCategory === cat.id ? 1 : 0,
                  }}
                  whileHover={activeCategory !== cat.id ? {
                    scale: 1.04,
                    y: -2,
                    borderColor: "rgba(201,169,110,0.5)",
                    color: "#C9A96E",
                    backgroundColor: "rgba(201,169,110,0.06)",
                    boxShadow: "0 3px 12px rgba(201,169,110,0.12)",
                  } : {}}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.8,
                  }}
                >
                  {/* Animated gold background that slides between buttons */}
                  {activeCategory === cat.id && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full md:rounded-sm"
                      style={{
                        background: "linear-gradient(135deg, #C9A96E 0%, #d4b87a 50%, #b89a5e 100%)",
                        boxShadow: "0 4px 18px rgba(201,169,110,0.35), 0 1px 6px rgba(201,169,110,0.18)",
                        zIndex: -1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                        mass: 0.8,
                      }}
                    />
                  )}
                  {/* Shimmer sweep on newly active */}
                  {activeCategory === cat.id && (
                    <motion.span
                      key={`shimmer-${cat.id}`}
                      className="absolute inset-0 rounded-full md:rounded-sm pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                        zIndex: 0,
                      }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                    />
                  )}
                  <motion.span
                    className="relative z-[1]"
                    animate={{
                      fontWeight: activeCategory === cat.id ? 600 : 400,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    {cat.label}
                  </motion.span>
                  <motion.span
                    className="ml-2 text-[0.58rem] relative z-[1]"
                    animate={{
                      opacity: activeCategory === cat.id ? 0.9 : 0.4,
                      background: activeCategory === cat.id ? "rgba(255,255,255,0.22)" : "rgba(201,169,110,0.1)",
                      scale: activeCategory === cat.id ? 1.05 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    style={{
                      padding: "1px 6px",
                      borderRadius: "8px",
                      display: "inline-block",
                    }}
                  >
                    {cat.count}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Main layout */}
          <div className={`${showFilters ? "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12" : ""}`}>
            {/* Filters sidebar */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.35 }}
                  className="overflow-hidden"
                >
                  <div className="sticky top-28">
                    <ArtworkFilters
                      filters={filters}
                      onChange={setFilters}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      itemCount={sorted.length}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid / List */}
            <div>
              {/* Results count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-[0.75rem] text-[#bbb]">
                  {sorted.length} {sorted.length === 1 ? "obra" : "obras"}
                  {activeCategory !== "all" &&
                    ` em ${categories.find((c) => c.id === activeCategory)?.label}`}
                </p>
                {!showFilters && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-[0.75rem] text-[#999] bg-transparent border-none outline-none cursor-pointer"
                  >
                    <option value="newest">Mais Recente</option>
                    <option value="oldest">Mais Antigo</option>
                    <option value="price-asc">Preço: Baixo a Alto</option>
                    <option value="price-desc">Preço: Alto a Baixo</option>
                    <option value="title">Título A-Z</option>
                  </select>
                )}
              </div>

              {sorted.length === 0 ? (
                <FadeIn>
                  <div className="text-center py-32 px-6 bg-white border border-black/[0.04] rounded-sm">
                    <div className="max-w-md mx-auto">
                      <div
                        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(196,149,106,0.08)" }}
                      >
                        <SlidersHorizontal size={28} style={{ color: GOLD }} />
                      </div>
                      <p className="text-[1rem] text-[#666] mb-2">Nenhuma obra encontrada</p>
                      <p className="text-[0.85rem] text-[#999] mb-6">
                        Tente ajustar os filtros selecionados
                      </p>
                      <button
                        onClick={() =>
                          setFilters({
                            techniques: [],
                            sizes: [],
                            colors: [],
                            priceRange: [0, 5000],
                            themes: [],
                            availableOnly: false,
                          })
                        }
                        className="text-[0.75rem] tracking-[0.1em] uppercase transition-opacity hover:opacity-70"
                        style={{ color: GOLD }}
                      >
                        Limpar filtros
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ) : viewMode === "list" ? (
                <div>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <ArtworkSkeleton key={i} viewMode="list" />
                    ))
                  ) : sorted.map((work, index) => (
                    <ArtworkCard
                      key={work.id}
                      work={work}
                      index={index}
                      viewMode="list"
                      onQuickView={setQuickViewWork}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-3 md:gap-8 ${
                    showFilters
                      ? "grid-cols-2 sm:grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
                  }`}
                >
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <ArtworkSkeleton key={i} viewMode="grid" />
                    ))
                  ) : sorted.map((work, index) => (
                    <ArtworkCard
                      key={work.id}
                      work={work}
                      index={index}
                      viewMode="grid"
                      onQuickView={setQuickViewWork}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — Contextual CTA / Private Viewing ════════════════════ */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={IMG_INTERIOR}
            alt="Interior com obra de arte"
            className="w-full h-full object-cover"
            sizes="100vw"
            style={{ filter: "brightness(0.25) saturate(0.6)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(196,149,106,0.2) 0%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p
              className="text-[0.6rem] tracking-[0.4em] uppercase mb-6"
              style={{ color: GOLD_LIGHT }}
            >
              Experiência Exclusiva
            </p>
            <h2
              className="mb-6"
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                lineHeight: 1.15,
              }}
            >
              Agende uma Visita
              <br />
              <span style={{ color: GOLD_LIGHT }}>Privada ao Atelier</span>
            </h2>
            <p
              className="text-[0.95rem] max-w-lg mx-auto mb-10 leading-[1.9]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Conheça as obras pessoalmente num ambiente reservado. Inclui consultoria
              personalizada de integração da obra no seu espaço.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contactos"
                className="px-10 py-4 text-center text-white text-[0.72rem] tracking-[0.18em] uppercase rounded-sm transition-opacity hover:opacity-85"
                style={{ background: GOLD }}
              >
                Agendar Visita
              </Link>
              <Link
                to="/contactos"
                className="px-10 py-4 text-center text-[0.72rem] tracking-[0.18em] uppercase rounded-sm transition-all hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.7)" }}
              >
                Enviar Mensagem
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ SECTION 6 — Sobre o Processo / Behind the Scenes ═══════════════ */}
      <section className="py-20 md:py-28 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <div
                  className="relative overflow-hidden rounded-sm"
                  style={{ aspectRatio: "4/5" }}
                >
                  <ImageWithFallback
                    src={image_0fb117f1894ee3a8ddb0d956bce777924e5e36c4}
                    alt="Atelier da artista"
                    className="w-full h-full object-contain bg-[#fafaf8]"
                  />
                </div>
                {/* Decorative frame accent */}
                <div
                  className="absolute -bottom-4 -right-4 w-full h-full border-2 rounded-sm -z-10"
                  style={{ borderColor: "rgba(196,149,106,0.2)" }}
                />
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div>
                <p
                  className="text-[0.6rem] tracking-[0.35em] uppercase mb-4"
                  style={{ color: GOLD }}
                >
                  O Processo Criativo
                </p>
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#1a1a1a",
                    fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                    lineHeight: 1.2,
                  }}
                >
                  Cada Obra Nasce de um
                  <br />
                  <span style={{ color: GOLD }}>Diálogo com a Matéria</span>
                </h2>
                <p className="text-[0.92rem] text-[#888] leading-[2] mb-6 max-w-lg">
                  O processo de Ana Alexandre é simultaneamente intuitivo e disciplinado.
                  A matéria — o pigmento, a tela, a resina — não é apenas suporte, mas
                  parceira de criação. Cada obra evolui em camadas, num processo que pode
                  durar semanas ou meses.
                </p>
                <blockquote
                  className="pl-5 mb-8"
                  style={{
                    borderLeft: `2px solid ${GOLD}`,
                    fontFamily: "var(--font-serif)",
                    color: "#555",
                    fontStyle: "italic",
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                  }}
                >
                  &ldquo;A tela não recebe — ela responde. E é nessa resposta que a obra encontra o seu caminho.&rdquo;
                </blockquote>
                <Link
                  to="/sobre"
                  className="inline-flex items-center gap-2 text-[0.75rem] tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                  style={{ color: GOLD }}
                >
                  Conhecer a Artista <ArrowRight size={14} />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ Quick View Modal ═════════════════════════════════════════════════ */}
      <AnimatePresence>
        {quickViewWork && (
          <QuickViewModal work={quickViewWork} onClose={() => setQuickViewWork(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
