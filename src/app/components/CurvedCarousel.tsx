import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { GOLD } from "../../lib/tokens";
const GOLD_DARK = "#B8922A";

interface ArtworkCard {
  id: number;
  title: string;
  artist: string;
  year: string;
  medium: string;
  image: string;
}

const CAROUSEL_WORKS: ArtworkCard[] = [
  {
    id: 1,
    title: "Fragmentos de Luz",
    artist: "Ana Alexandre",
    year: "2025",
    medium: "Acrílico sobre Tela",
    image:
      "https://images.unsplash.com/photo-1604263710021-2ac5cd439907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 2,
    title: "Horizonte Interior",
    artist: "Ana Alexandre",
    year: "2024",
    medium: "Óleo sobre Tela",
    image:
      "https://images.unsplash.com/photo-1773067359451-65f74198f10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 3,
    title: "Memória Tátil",
    artist: "Ana Alexandre",
    year: "2024",
    medium: "Técnica Mista",
    image:
      "https://images.unsplash.com/photo-1762541477845-585f94a4dec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 4,
    title: "Presença Silenciosa",
    artist: "Ana Alexandre",
    year: "2023",
    medium: "Escultura · Resina",
    image:
      "https://images.unsplash.com/photo-1759608542767-e1a7c3ac09a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 5,
    title: "Dissolução",
    artist: "Ana Alexandre",
    year: "2025",
    medium: "Aguarela sobre Papel",
    image:
      "https://images.unsplash.com/photo-1582201957417-24546f2e643d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 6,
    title: "Estudo nº 47",
    artist: "Ana Alexandre",
    year: "2023",
    medium: "Carvão sobre Papel",
    image:
      "https://images.unsplash.com/photo-1765029582791-fe12ee09188c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: 7,
    title: "Terra Prometida",
    artist: "Ana Alexandre",
    year: "2024",
    medium: "Acrílico · Técnica Mista",
    image:
      "https://images.unsplash.com/photo-1628883253093-e3eea87564e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

function getCardStyle(offset: number, total: number) {
  // offset: distance from center (-3 to +3)
  const absOff = Math.abs(offset);
  const sign = Math.sign(offset);

  const scale = Math.max(0.55, 1 - absOff * 0.14);
  const translateX = offset * 260;
  const translateZ = -absOff * 180;
  const rotateY = -sign * Math.min(absOff * 18, 45);
  const opacity = absOff <= 3 ? Math.max(0.3, 1 - absOff * 0.22) : 0;
  const zIndex = total - absOff;

  return {
    transform: `perspective(1200px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
    zIndex,
  };
}

function getCardStyleMobile(offset: number, total: number) {
  const absOff = Math.abs(offset);
  const sign = Math.sign(offset);

  const scale = Math.max(0.6, 1 - absOff * 0.16);
  const translateX = offset * 160;
  const translateZ = -absOff * 120;
  const rotateY = -sign * Math.min(absOff * 15, 40);
  const opacity = absOff <= 2 ? Math.max(0.3, 1 - absOff * 0.3) : 0;
  const zIndex = total - absOff;

  return {
    transform: `perspective(900px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    opacity,
    zIndex,
  };
}

export function CurvedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = CAROUSEL_WORKS.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const next = useCallback(() => setActiveIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + total) % total), [total]);

  // Auto-rotate
  useEffect(() => {
    if (hovered) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, next]);

  // Touch/drag support com validação de eixo (scroll natural)
  const touchStartPos = useRef({ x: 0, y: 0 });
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartPos.current.y;
    
    // Se o intent é scroll vertical (Y > X), ignoramos a lógica do carrossel
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      diffX > 0 ? prev() : next();
    }
  };

  const visibleRange = isMobile ? 2 : 3;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      {/* Carousel container */}
      <div
        style={{
          position: "relative",
          height: isMobile ? 380 : 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {CAROUSEL_WORKS.map((work, i) => {
          let offset = i - activeIndex;
          // Wrap around
          if (offset > total / 2) offset -= total;
          if (offset < -total / 2) offset += total;

          if (Math.abs(offset) > visibleRange) return null;

          const style = isMobile
            ? getCardStyleMobile(offset, total)
            : getCardStyle(offset, total);
          const isCenter = offset === 0;

          return (
            <motion.div
              key={work.id}
              onClick={() => !isCenter && setActiveIndex(i)}
              onMouseEnter={() => setHoveredCard(work.id)}
              onMouseLeave={() => setHoveredCard(null)}
              animate={{
                ...style,
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                position: "absolute",
                width: isMobile ? 220 : 300,
                cursor: isCenter ? "default" : "pointer",
                transformStyle: "preserve-3d",
                pointerEvents: Math.abs(offset) <= visibleRange ? "auto" : "none",
                willChange: "transform",
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: isCenter
                    ? isMobile ? `0 14px 40px rgba(0,0,0,0.12), 0 0 0 1px ${GOLD}66` : `0 24px 60px rgba(0,0,0,0.18), 0 0 0 1.5px ${hoveredCard === work.id ? GOLD : "transparent"}`
                    : "0 8px 30px rgba(0,0,0,0.1)",
                  transition: "box-shadow 0.4s ease, transform 0.4s ease",
                  transform:
                    isCenter && hoveredCard === work.id && !isMobile
                      ? "translateY(-6px)"
                      : "translateY(0)",
                }}
              >
                {/* Gold glow on active hover (disabled on mobile for performance) */}
                {isCenter && hoveredCard === work.id && !isMobile && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -2,
                      borderRadius: 18,
                      background: `linear-gradient(135deg, ${GOLD}44, ${GOLD}22, transparent)`,
                      zIndex: -1,
                      filter: "blur(8px)",
                      willChange: "opacity",
                    }}
                  />
                )}

                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    paddingBottom: "133%", // 3:4
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={work.image}
                    alt={work.title}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.6s ease",
                      transform:
                        isCenter && hoveredCard === work.id
                          ? "scale(1.04)"
                          : "scale(1)",
                    }}
                  />
                  {/* Subtle gradient at bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "40%",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.06), transparent)",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: isMobile ? "12px 14px 14px" : "16px 20px 20px" }}>
                  <h4
                    style={{
                      fontFamily: "var(--font-serif)",
                      color: "#1A1A1A",
                      fontSize: isMobile ? "0.95rem" : "1.1rem",
                      margin: 0,
                      marginBottom: 4,
                    }}
                  >
                    {work.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.58rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: GOLD_DARK,
                      margin: 0,
                      marginBottom: 6,
                    }}
                  >
                    {work.artist}
                  </p>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(26,26,26,0.45)",
                      margin: 0,
                      marginBottom: isCenter ? 10 : 0,
                    }}
                  >
                    {work.year} · {work.medium}
                  </p>

                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      <Link
                        to="/galeria"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: GOLD_DARK,
                          fontSize: "0.62rem",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          textDecoration: "none",
                          transition: "color 0.3s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = "#8B7023")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = GOLD_DARK)
                        }
                      >
                        Ver Obra <ArrowRight size={11} />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Navigation arrows — desktop */}
        {!isMobile && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              style={{
                position: "absolute",
                left: "clamp(12px, 4vw, 48px)",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `1px solid rgba(201,169,110,0.3)`,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                color: "#1A1A1A",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.color = GOLD;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)";
                e.currentTarget.style.color = "#1A1A1A";
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Seguinte"
              style={{
                position: "absolute",
                right: "clamp(12px, 4vw, 48px)",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `1px solid rgba(201,169,110,0.3)`,
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                color: "#1A1A1A",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = GOLD;
                e.currentTarget.style.color = GOLD;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,110,0.3)";
                e.currentTarget.style.color = "#1A1A1A";
              }}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 28,
        }}
      >
        {CAROUSEL_WORKS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Ir para obra ${i + 1}`}
            style={{
              width: activeIndex === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background:
                activeIndex === i
                  ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`
                  : "rgba(26,26,26,0.12)",
              cursor: "pointer",
              transition: "all 0.4s ease",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
