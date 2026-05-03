import { useState, useEffect, useRef, Suspense } from "react";
import { subscribeNewsletter } from "../../lib/db";
import { getConfigAll } from "../../lib/db";
import { signOut } from "../../lib/auth";
import { supabase } from "../../lib/supabase";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, ChevronDown, Mail, Phone, MapPin, Instagram, ArrowRight, Send, Package, LogOut, UserCircle, Facebook, Linkedin, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage, type Lang } from "../i18n";
import { PWAInstallPrompt } from "./PWAInstallPrompt";
import { ErrorBoundary } from "./ErrorBoundary";
import { GOLD, CREAM } from "../../lib/tokens";
import {
  buildSiteContentFromConfigs,
  getMailToHref,
  getTelephoneHref,
  SITE_CONTENT_DEFAULTS,
  splitAddress,
} from "../../lib/siteContent";

const langOptions = [
  { code: "pt" as Lang, flagCdn: "pt", label: "portugues - PT", short: "PT" },
  { code: "es" as Lang, flagCdn: "es", label: "espanol - ES", short: "ES" },
  { code: "en" as Lang, flagCdn: "gb", label: "English - EN", short: "EN" },
  { code: "fr" as Lang, flagCdn: "fr", label: "francais - FR", short: "FR" },
];

function FlagImg({ code, size = 22, circular = false }: { code: string; size?: number; circular?: boolean }) {
  if (!code) return null;
  return (
    <span style={{
      display: "inline-flex",
      width: circular ? `${size}px` : `${Math.round(size * 1.4)}px`,
      height: `${size}px`,
      borderRadius: circular ? "50%" : "3px",
      overflow: "hidden",
      flexShrink: 0,
      border: circular ? "1.5px solid #0000001F" : "1px solid #00000014",
    }}>
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        alt={code?.toUpperCase() ?? ""}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </span>
  );
}

// Pinterest SVG Icon Component
function PinterestIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.06-.57-.11-1.44.02-2.06.12-.57.77-3.27.77-3.27s-.2-.4-.2-.98c0-.92.53-1.61 1.2-1.61.56 0 .84.43.84.94 0 .57-.37 1.43-.56 2.22-.16.67.34 1.21 1 1.21 1.2 0 2.13-1.27 2.13-3.1 0-1.62-1.16-2.76-2.82-2.76-1.92 0-3.05 1.44-3.05 2.93 0 .58.22 1.2.5 1.54.05.06.06.12.04.18-.05.2-.15.61-.17.7-.02.11-.08.14-.19.08-.67-.31-1.09-1.3-1.09-2.1 0-2.14 1.55-4.1 4.47-4.1 2.35 0 4.18 1.67 4.18 3.91 0 2.33-1.47 4.21-3.51 4.21-.69 0-1.33-.36-1.55-.78l-.42 1.61c-.15.59-.56 1.33-.84 1.78A12 12 0 1 0 12 0z" />
    </svg>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const selectedLang = langOptions.find(l => l.code === lang) || langOptions[0];
  const [cartCount] = useState(0);
  const langRef = useRef<HTMLDivElement>(null);

  // Account state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountHover, setAccountHover] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setUserEmail(data.session?.user?.email ?? null);
      setUserName(data.session?.user?.user_metadata?.display_name ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user?.email ?? null);
      setUserName(session?.user?.user_metadata?.display_name ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/", label: t("nav.montra") },
    { path: "/galeria", label: t("nav.galeria") },
    { path: "/sobre", label: t("nav.sobre") },
    { path: "/orientacao", label: t("nav.mentoria") },
    { path: "/contactos", label: t("nav.contactos") },
  ];

  const mobileOnlyLinks = [
    { path: "/premio", label: t("nav.premio") },
  ];

  const footerExplore = [
    { path: "/", label: t("footer.montra") },
    { path: "/galeria", label: t("footer.galeria") },
    { path: "/sobre", label: t("footer.sobre") },
    { path: "/contactos", label: t("footer.atelier") },
  ];

  const footerFormacao = [
    { path: "/orientacao", label: t("footer.mentoria") },
    { path: "/orientacao#programas", label: t("footer.workshops") },
    { path: "/orientacao#faq", label: t("footer.faq") },
    { path: "/orientacao#testemunhos", label: t("footer.testemunhos") },
  ];

  const footerLegal = [
    { label: t("footer.termos") },
    { label: t("footer.privacidade") },
    { label: t("footer.reclamacoes") },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1a1a1a] relative">

      {/* ═ HEADER ══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(201,169,110,0.12)" }}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-12 flex items-center justify-between h-14 md:h-[70px]">

          {/* Mobile: centered logo area */}
          <Link to="/" aria-label="Ana Alexandre - Página Inicial" className="flex flex-col md:flex-row md:items-baseline md:gap-2">
            <span
              className="text-[1rem] md:text-[1.1rem] tracking-[0.06em] leading-tight"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 700, background: "linear-gradient(135deg, #C9A96E 0%, #e0c48a 50%, #C9A96E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              ANA ALEXANDRE
            </span>
            <span
              className="text-[0.5rem] md:text-[0.7rem] tracking-[0.18em] uppercase md:ml-1 hidden md:inline"
              style={{ color: GOLD }}
            >
              | ATELIER
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative text-[0.75rem] tracking-[0.18em] uppercase transition-colors duration-300 pb-0.5 group"
                  style={{ color: isActive ? GOLD : "#666" }}
                >
                  {link.label}
                  {isActive ? (
                    <span
                      className="absolute -bottom-0.5 left-0 right-0 h-[1px]"
                      style={{ background: `linear-gradient(90deg, ${GOLD}, #e0c48a)` }}
                    />
                  ) : (
                    <span
                      className="absolute -bottom-0.5 left-0 right-0 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                      style={{ background: `linear-gradient(90deg, ${GOLD}, #e0c48a)` }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">

            {/* Language Dropdown - Desktop */}
            <div ref={langRef} className="relative hidden md:block">
              <button
                className="flex items-center gap-2 text-[#333] hover:text-[#1a1a1a] transition-colors text-[0.78rem] tracking-[0.06em] border border-black/[0.14] rounded-full px-3 py-1.5"
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Selecionar idioma"
                style={{ fontWeight: 500 }}
              >
                <FlagImg code={selectedLang.flagCdn} size={22} circular />
                <span className="tracking-[0.08em]">{selectedLang.short}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-md z-50 overflow-hidden"
                    style={{ width: "230px", boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                      <p className="text-[0.65rem] tracking-[0.18em] uppercase text-[#999]" style={{ fontWeight: 600 }}>Mudar Idioma</p>
                    </div>
                    <div className="py-1.5">
                      {langOptions.map((lang) => {
                        const isSelected = selectedLang.code === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => { setLang(lang.code); setLangOpen(false); }}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                            style={{ background: isSelected ? "#EBF4FD" : "transparent", color: isSelected ? "#1a1a1a" : "#555", fontWeight: isSelected ? 600 : 400, fontSize: "0.86rem" }}
                          >
                            <span className="flex-shrink-0 flex items-center justify-center" style={{ width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${isSelected ? "#1a73e8" : "#bbb"}`, background: "transparent" }}>
                              {isSelected && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1a73e8", display: "block" }} />}
                            </span>
                            <FlagImg code={lang.flagCdn} size={16} circular={false} />
                            <span>{lang.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language Selector - Mobile */}
            <div className="relative md:hidden">
              <button
                className="flex items-center gap-1.5 text-[#333] hover:text-[#1a1a1a] transition-colors text-[0.75rem] tracking-[0.06em] border border-black/[0.14] rounded-full px-2.5 py-1.5"
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Selecionar idioma"
                style={{ fontWeight: 500 }}
              >
                <FlagImg code={selectedLang.flagCdn} size={20} circular />
                <span className="tracking-[0.08em] text-[0.7rem]">{selectedLang.short}</span>
                <ChevronDown size={10} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-md z-50 overflow-hidden"
                    style={{ width: "200px", boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <div className="px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#999]" style={{ fontWeight: 600 }}>Idioma / Language</p>
                    </div>
                    <div className="py-1.5">
                      {langOptions.map((lang) => {
                        const isSelected = selectedLang.code === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => { setLang(lang.code); setLangOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-left transition-colors"
                            style={{ background: isSelected ? "#EBF4FD" : "transparent", color: isSelected ? "#1a1a1a" : "#555", fontWeight: isSelected ? 600 : 400, fontSize: "0.8rem" }}
                          >
                            <span className="flex-shrink-0 flex items-center justify-center" style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${isSelected ? "#1a73e8" : "#bbb"}`, background: "transparent" }}>
                              {isSelected && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1a73e8", display: "block" }} />}
                            </span>
                            <FlagImg code={lang.flagCdn} size={14} circular={false} />
                            <span>{lang.short}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account Icon */}
            <div ref={accountRef} style={{ position: "relative" }} className="hidden md:block">
              <button
                onClick={() => {
                  if (authLoading) return;
                  if (isLoggedIn) {
                    setAccountOpen(v => !v);
                  } else {
                    navigate("/login");
                  }
                }}
                onMouseEnter={() => setAccountHover(true)}
                onMouseLeave={() => setAccountHover(false)}
                aria-label={isLoggedIn ? "A minha conta" : "Entrar / Criar conta"}
                style={{
                  position: "relative",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "none", border: "none", cursor: "pointer", padding: "4px",
                  color: accountHover || accountOpen ? GOLD : "#555",
                  transition: "color 0.2s",
                }}
              >
                {isLoggedIn ? (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.85 }}>
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                ) : (
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}

                {!isLoggedIn && (
                  <span style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 9, height: 9, borderRadius: "50%",
                    background: "#BBBBBB", border: "1.5px solid white",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "6px", color: "white", fontWeight: 700, lineHeight: 1,
                  }}>+</span>
                )}

                {isLoggedIn && (
                  <span style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 8, height: 8, borderRadius: "50%",
                    background: GOLD, border: "1.5px solid white",
                    boxShadow: `0 0 4px ${GOLD}88`,
                  }} />
                )}

                {/* Tooltip */}
                <span style={{
                  position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
                  transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff",
                  fontSize: "0.62rem", letterSpacing: "0.07em", whiteSpace: "nowrap",
                  padding: "5px 10px", borderRadius: 3, pointerEvents: "none",
                  opacity: accountHover && !accountOpen ? 1 : 0,
                  transition: "opacity 0.18s", zIndex: 60,
                }}>
                  {isLoggedIn ? "A minha conta" : "Entrar / Criar conta"}
                  <span style={{
                    position: "absolute", top: "100%", left: "50%",
                    transform: "translateX(-50%)", width: 0, height: 0,
                    borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
                    borderTop: "4px solid #1a1a1a",
                  }} />
                </span>
              </button>

              {/* Logged-in dropdown */}
              <AnimatePresence>
                {isLoggedIn && accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.16 }}
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 10px)",
                      background: "white", width: 210,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,0,0,0.07)", borderRadius: 6,
                      overflow: "hidden", zIndex: 50,
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "#FAFAF8" }}>
                      <p style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#999", fontWeight: 600, marginBottom: 2 }}>Bem-vindo</p>
                      <p style={{ fontSize: "0.8rem", color: "#1a1a1a", fontWeight: 500 }}>{userName ?? userEmail}</p>
                    </div>
                    <div style={{ padding: "6px 0" }}>
                      {[
                        { label: "O meu perfil", Icon: UserCircle },
                        { label: "As minhas encomendas", Icon: Package },
                      ].map(({ label, Icon }) => (
                        <button
                          key={label}
                          onClick={() => setAccountOpen(false)}
                          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.84rem", color: "#444", transition: "background 0.15s", fontFamily: "var(--font-sans)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F8F5F2")}
                          onMouseLeave={e => (e.currentTarget.style.background = "none")}
                        >
                          <Icon size={14} strokeWidth={1.5} style={{ color: GOLD, flexShrink: 0 }} />
                          {label}
                        </button>
                      ))}
                      <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", margin: "4px 8px" }} />
                      <button
                        onClick={async () => { await signOut(); setAccountOpen(false); navigate("/login"); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: "0.84rem", color: "#CC3333", transition: "background 0.15s", fontFamily: "var(--font-sans)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FFF5F5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <LogOut size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                        Sair
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <Link
              to="/carrinho"
              className="relative text-[#555] hover:text-[#1a1a1a] transition-colors p-1 hidden md:flex"
              aria-label="Ver Carrinho"
            >
              <ShoppingCart size={19} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{ background: GOLD, fontSize: "0.6rem" }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Toggle — minimalist two-line hamburger */}
            <button
              className="md:hidden ml-1 flex items-center justify-center w-12 h-12 active:scale-95 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <X size={22} color={GOLD} strokeWidth={1.5} />
              ) : (
                /* Two-line minimalist hamburger */
                <div className="flex flex-col items-end gap-[5px]">
                  <div style={{ width: 22, height: 1.5, background: GOLD, borderRadius: 1 }} />
                  <div style={{ width: 16, height: 1.5, background: GOLD, borderRadius: 1 }} />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ══ MOBILE MENU ══ */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden overflow-hidden"
            style={{ background: "#FAF8F5" }}
          >
            {/* Subtle decorative circle */}
            <div
              className="pointer-events-none absolute"
              style={{
                bottom: "-15%",
                right: "-20%",
                width: "70vw",
                height: "70vw",
                borderRadius: "50%",
                border: `1px solid rgba(201,169,110,0.08)`,
              }}
            />

            <div className="flex flex-col h-full pt-14">
              {/* Navigation links */}
              <nav className="flex-1 flex flex-col justify-center px-8 -mt-6">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className="block py-4 active:opacity-60 transition-opacity"
                        style={{
                          textDecoration: "none",
                          borderBottom: i < navLinks.length - 1 ? "1px solid rgba(201,169,110,0.08)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Active indicator dot */}
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isActive ? GOLD : "transparent",
                                border: isActive ? "none" : `1px solid rgba(201,169,110,0.25)`,
                                flexShrink: 0,
                                transition: "all 0.2s",
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "1.65rem",
                                color: isActive ? GOLD : "#1a1a1a",
                                letterSpacing: "0.01em",
                                transition: "color 0.2s",
                              }}
                            >
                              {link.label}
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            style={{
                              transform: "rotate(-90deg)",
                              color: isActive ? GOLD : "rgba(26,26,26,0.15)",
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                {mobileOnlyLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        className="block py-4 active:opacity-60 transition-opacity"
                        style={{
                          textDecoration: "none",
                          borderBottom: i < mobileOnlyLinks.length - 1 ? "1px solid rgba(201,169,110,0.08)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Active indicator dot */}
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isActive ? GOLD : "transparent",
                                border: isActive ? "none" : `1px solid rgba(201,169,110,0.25)`,
                                flexShrink: 0,
                                transition: "all 0.2s",
                              }}
                            />
                            <span
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontSize: "1.65rem",
                                color: isActive ? GOLD : "#1a1a1a",
                                letterSpacing: "0.01em",
                                transition: "color 0.2s",
                              }}
                            >
                              {link.label}
                            </span>
                          </div>
                          <ChevronDown
                            size={14}
                            style={{
                              transform: "rotate(-90deg)",
                              color: isActive ? GOLD : "rgba(26,26,26,0.15)",
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Bottom section with contact + branding */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="px-8 pb-8"
                style={{ borderTop: `1px solid rgba(201,169,110,0.1)` }}
              >
                {/* Quick contact */}
                <div className="flex items-center gap-6 pt-6 pb-5">
                  <a
                    href="tel:+351967060682"
                    className="flex items-center justify-center w-11 h-11 active:scale-95 transition-transform"
                    style={{
                      border: `1px solid rgba(201,169,110,0.25)`,
                      textDecoration: "none",
                      color: GOLD,
                    }}
                    aria-label="Ligar"
                  >
                    <Phone size={16} />
                  </a>
                  <a
                    href="mailto:atelier.anaalexandre@gmail.com"
                    className="flex items-center justify-center w-11 h-11 active:scale-95 transition-transform"
                    style={{
                      border: `1px solid rgba(201,169,110,0.25)`,
                      textDecoration: "none",
                      color: GOLD,
                    }}
                    aria-label="Email"
                  >
                    <Mail size={16} />
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-11 h-11 active:scale-95 transition-transform"
                    style={{
                      border: `1px solid rgba(201,169,110,0.25)`,
                      textDecoration: "none",
                      color: GOLD,
                    }}
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                </div>

                {/* Branding */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 36,
                        height: 36,
                        border: `1px solid rgba(201,169,110,0.25)`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: GOLD,
                          fontSize: "0.8rem",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        AAA
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(26,26,26,0.25)",
                      }}
                    >
                      Atelier · Tomar
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.55rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,26,0.18)",
                    }}
                  >
                    by HARTEG
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MAIN CONTENT ══ */}
      <main className="pt-14 md:pt-[70px] relative">
        <ErrorBoundary>
          <Suspense fallback={
            <div style={{
              height: "calc(100vh - 70px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: "1px solid rgba(199, 161, 107, 0.15)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  border: "1px solid transparent",
                  borderTop: "1px solid #C7A16B",
                  borderRadius: "50%",
                  position: "absolute",
                  animation: "loading-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite"
                }} />
                <span style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: "#C7A16B",
                  opacity: 0.6
                }}>AA</span>
              </div>
              <style>{`
                @keyframes loading-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              `}</style>
            </div>
          }>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <SiteFooter />

      {/* ══ WHATSAPP FLOAT ══ */}
      <a
        href="https://wa.me/351967060682?text=Ol%C3%A1!%20Visitei%20o%20site%20e%20gostaria%20de%20obter%20mais%20informa%C3%A7%C3%B5es."
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" width="26" height="26">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>

      <PWAInstallPrompt />
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────
const IMG_GALLERY = "https://images.unsplash.com/photo-1506286397972-ae8e5d648675?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const GL = "rgba(201,169,110,";

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}
      style={{ color: "rgba(26,26,26,0.52)", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.22s", display: "inline-flex", alignItems: "center", gap: "9px" }}
      onMouseOver={e => { e.currentTarget.style.color = GOLD; }}
      onMouseOut={e => { e.currentTarget.style.color = "rgba(26,26,26,0.52)"; }}
    >
      <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0, opacity: 0.55 }} />
      {children}
    </Link>
  );
}

function FAnchor({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href}
      style={{ color: "rgba(26,26,26,0.52)", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.22s", display: "inline-flex", alignItems: "center", gap: "9px" }}
      onMouseOver={e => { e.currentTarget.style.color = GOLD; }}
      onMouseOut={e => { e.currentTarget.style.color = "rgba(26,26,26,0.52)"; }}
    >
      <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0, opacity: 0.55 }} />
      {children}
    </a>
  );
}

function SiteFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const newsletterLockRef = useRef(false);
  const newsletterAbortRef = useRef<AbortController | null>(null);
  const { t } = useLanguage();
  const [siteContent, setSiteContent] = useState({
    site_description: SITE_CONTENT_DEFAULTS.site_description,
    social_instagram: SITE_CONTENT_DEFAULTS.social_instagram,
    contacto_email: SITE_CONTENT_DEFAULTS.contacto_email,
    contacto_telefone: SITE_CONTENT_DEFAULTS.contacto_telefone,
    contacto_morada: SITE_CONTENT_DEFAULTS.contacto_morada,
    contacto_horario: SITE_CONTENT_DEFAULTS.contacto_horario,
  });
  const footerAddress = splitAddress(siteContent.contacto_morada);
  const footerMailHref = getMailToHref(siteContent.contacto_email);
  const footerTelHref = getTelephoneHref(siteContent.contacto_telefone);

  const footerExplore = [
    { path: "/", label: t("footer.montra") },
    { path: "/galeria", label: t("footer.galeria") },
    { path: "/sobre", label: t("footer.sobre") },
    { path: "/contactos", label: t("footer.atelier") },
  ];

  const footerFormacao = [
    { path: "/orientacao", label: t("footer.mentoria") },
    { path: "/orientacao#programas", label: t("footer.workshops") },
    { path: "/orientacao#faq", label: t("footer.faq") },
    { path: "/orientacao#testemunhos", label: t("footer.testemunhos") },
  ];

  const footerLegal = [
    { label: t("footer.termos") },
    { label: t("footer.privacidade") },
    { label: t("footer.reclamacoes") },
  ];

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterLockRef.current) return;
    newsletterLockRef.current = true;
    newsletterAbortRef.current?.abort();
    newsletterAbortRef.current = new AbortController();
    setNewsletterError(null);
    setNewsletterSubmitting(true);
    try {
      await subscribeNewsletter(newsletterEmail, { signal: newsletterAbortRef.current.signal });
      setNewsletterSent(true);
    } catch (err) {
      const error = err as { message?: string; name?: string };
      setNewsletterError(error.name === "AbortError" ? "Subscri\u00e7\u00e3o interrompida. Tenta novamente." : (error.message || "Erro ao subscrever. Tenta novamente."));
      newsletterLockRef.current = false;
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      newsletterAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    async function loadSiteFooterContent() {
      try {
        const rows = await getConfigAll();
        const safe = buildSiteContentFromConfigs(rows);
        setSiteContent({
          site_description: safe.site_description,
          social_instagram: safe.social_instagram,
          contacto_email: safe.contacto_email,
          contacto_telefone: safe.contacto_telefone,
          contacto_morada: safe.contacto_morada,
          contacto_horario: safe.contacto_horario,
        });
      } catch (error) {
        if (import.meta.env?.DEV) console.error("Failed to load footer content:", error);
      }
    }
    void loadSiteFooterContent();
  }, []);

  return (
    <footer>
      {/* ══ NEWSLETTER BAND ══ */}
      <div style={{ background: "linear-gradient(135deg, #C9A96E 0%, #b89a5e 50%, #d4af72 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 14px)", pointerEvents: "none" }} />
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px,4vw,30px) clamp(24px,6vw,80px)", gap: "20px", position: "relative", zIndex: 1 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div className="hidden sm:flex" style={{ width: 42, height: 42, border: "1px solid rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Mail size={16} color="rgba(255,255,255,0.92)" />
            </div>
            <div>
              <p style={{ fontSize: "0.57rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "3px" }}>Newsletter</p>
              <p style={{ color: "#fff", fontSize: "0.88rem", lineHeight: 1.4 }}>Acesso antecipado a coleções, exposições e workshops.</p>
            </div>
          </div>
          <AnimatePresence mode="wait">
            {newsletterSent ? (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.18)", padding: "11px 20px", border: "1px solid rgba(255,255,255,0.28)" }}
              >
                <span style={{ color: "#fff", fontSize: "1rem" }}>✓</span>
                <p style={{ color: "#fff", fontSize: "0.8rem", letterSpacing: "0.04em" }}>Subscrito com sucesso!</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleNewsletter}
                className="flex flex-col sm:flex-row items-stretch w-full sm:w-auto"
                style={{ minWidth: "clamp(240px,30vw,360px)" }}
                aria-busy={newsletterSubmitting}
              >
                <input
                  type="email" required value={newsletterEmail} disabled={newsletterSubmitting}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="O seu endereço de email"
                  style={{ flex: 1, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "14px 16px", fontSize: "1rem", outline: "none", fontFamily: "var(--font-sans)" }}
                  className="sm:!border-r-0 !text-[0.82rem] sm:!text-[0.82rem] !py-[11px] sm:!py-[11px] !px-[16px]"
                  onFocus={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
                  onBlur={e => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                />
                <button type="submit" disabled={newsletterSubmitting} aria-disabled={newsletterSubmitting}
                  className="flex items-center justify-center gap-2 sm:justify-start"
                  style={{ background: "#fff", border: "none", cursor: newsletterSubmitting ? "default" : "pointer", padding: "14px 26px", color: "#1a1a1a", fontSize: "0.63rem", letterSpacing: "0.18em", textTransform: "uppercase", transition: "all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)", whiteSpace: "nowrap", minHeight: "48px", boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset", borderRadius: "2px", fontWeight: 600, opacity: newsletterSubmitting ? 0.8 : 1 }}
                  onMouseOver={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#C9A96E"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.2), 0 0 0 1px rgba(201,169,110,0.3) inset"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.3) inset"; }}
                >
                  <Send size={12} /> {newsletterSubmitting ? "A subscrever..." : "Subscrever"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {newsletterError && (
            <p role="alert" aria-live="polite" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", marginTop: 8, textAlign: "center" }}>
              {newsletterError}
            </p>
          )}
        </div>
      </div>

      {/* ══ MAIN FOOTER BODY ══ */}
      <div style={{ background: CREAM, position: "relative" }}>
        {/* Gold separator line at top */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

        {/* 4-column grid */}
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(56px,7vw,88px) clamp(28px,6vw,80px) clamp(44px,5vw,64px)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.6fr", gap: "clamp(28px,4vw,60px)" }}
          className="!grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-[2fr_1fr_1fr_1.6fr]"
        >
          {/* Col 1: Brand */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 60, height: 60, border: `1px solid ${GL}0.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
              <span style={{ fontFamily: "var(--font-serif)", color: GOLD, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>AA</span>
            </div>
            <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1rem", letterSpacing: "0.08em", marginBottom: "3px" }}>ANA ALEXANDRE</p>
            <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", color: GOLD, textTransform: "uppercase", marginBottom: "16px" }}>ATELIER · EST. 2012</p>
            <div style={{ width: 36, height: 1, background: GOLD, opacity: 0.35, marginBottom: "18px" }} />
            <p style={{ color: "rgba(26,26,26,0.48)", fontSize: "0.82rem", lineHeight: 1.82, maxWidth: 255, marginBottom: "28px" }}>
              Arte contemporânea criada no coração de Tomar, Portugal. Obras originais, orientação artística e exposições internacionais.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {([
                { icon: Instagram, label: "Instagram", href: siteContent.social_instagram },
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=100063675053556" },
                { icon: PinterestIcon, label: "Pinterest", href: "https://pt.pinterest.com/aanaalexandre/" },
              ] as const).map(({ icon: Icon, label, href }) => (
                <a key={label} href={href} aria-label={label}
                  className="group"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `1px solid ${GL}0.18)`,
                    background: `${GL}0.04)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: `${GL}0.6)`,
                    textDecoration: "none",
                    transition: "all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${GOLD} 0%, #d4b87a 50%, #b89a5e 100%)`;
                    e.currentTarget.style.borderColor = GOLD;
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 6px 20px rgba(201,169,110,0.35), 0 2px 8px rgba(201,169,110,0.2)`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = `${GL}0.04)`;
                    e.currentTarget.style.borderColor = `${GL}0.18)`;
                    e.currentTarget.style.color = `${GL}0.6)`;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Icon size={15} style={{ position: "relative", zIndex: 1 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Explorar */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
              <div style={{ width: 14, height: 1, background: GOLD }} />
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD }}>Explorar</p>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "13px", listStyle: "none", padding: 0, margin: 0 }}>
              {footerExplore.map(link => (
                <li key={link.label}><FLink to={link.path}>{link.label}</FLink></li>
              ))}
            </ul>
          </div>

          {/* Col 3: Formação */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
              <div style={{ width: 14, height: 1, background: GOLD }} />
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD }}>Formação</p>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "13px", listStyle: "none", padding: 0, margin: 0, marginBottom: "30px" }}>
              {footerFormacao.map(link => (
                <li key={link.label}><FLink to={link.path}>{link.label}</FLink></li>
              ))}
            </ul>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: 14, height: 1, background: GOLD }} />
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD }}>Apoio</p>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "13px", listStyle: "none", padding: 0, margin: 0 }}>
              {["Envios", "Devoluções", "Certificados"].map(label => (
                <li key={label}><FLink to="/contactos?ref=servicos">{label}</FLink></li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
              <div style={{ width: 14, height: 1, background: GOLD }} />
              <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD }}>Contacto</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "24px" }}>
              {[
                { Icon: MapPin, main: footerAddress.line1, sub: footerAddress.line2 || "Tomar, Portugal", href: "https://maps.google.com/?q=Tomar,Portugal" },
                { Icon: Phone, main: siteContent.contacto_telefone, sub: "Chamada nacional", href: footerTelHref },
                { Icon: Mail, main: siteContent.contacto_email.split("@")[0] || siteContent.contacto_email, sub: siteContent.contacto_email.includes("@") ? `@${siteContent.contacto_email.split("@")[1]}` : "", href: footerMailHref },
              ].map(({ Icon, main, sub, href }) => (
                <a key={main} href={href}
                  style={{ display: "flex", gap: "12px", alignItems: "flex-start", textDecoration: "none", transition: "opacity 0.22s" }}
                  onMouseOver={e => (e.currentTarget.style.opacity = "0.65")}
                  onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                >
                  <div style={{ width: 32, height: 32, border: `1px solid ${GL}0.25)`, background: `${GL}0.06)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <Icon size={13} color={GOLD} />
                  </div>
                  <div>
                    <p style={{ color: "rgba(26,26,26,0.75)", fontSize: "0.82rem", lineHeight: 1.35 }}>{main}</p>
                    <p style={{ color: "rgba(26,26,26,0.36)", fontSize: "0.71rem" }}>{sub}</p>
                  </div>
                </a>
              ))}
            </div>
            {/* Schedule */}
            <div style={{ padding: "16px 18px", border: `1px solid ${GL}0.2)`, background: `linear-gradient(135deg, ${GL}0.07), ${GL}0.03))` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <div style={{ width: 3, height: 13, background: GOLD }} />
                <p style={{ fontSize: "0.48rem", letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD }}>Horário de Atendimento</p>
              </div>
              {[
                { d: "Seg – Sex", h: "10h – 13h / 14h – 19h", open: true },
                { d: "Sábado", h: "10h – 13h", open: true },
                { d: "Domingo", h: "Encerrado", open: false },
              ].map(({ d, h, open }, i, arr) => (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < arr.length - 1 ? `1px solid ${GL}0.07)` : "none" }}>
                  <p style={{ fontSize: "0.72rem", color: "rgba(26,26,26,0.48)" }}>{d}</p>
                  <span style={{ fontSize: "0.67rem", color: open ? GOLD : "rgba(26,26,26,0.26)" }}>{h}</span>
                </div>
              ))}
              <p style={{ fontSize: "0.58rem", color: "rgba(26,26,26,0.3)", marginTop: "10px", textAlign: "center", letterSpacing: "0.03em" }}>Visitas por marcação prévia</p>
            </div>
          </div>
        </div>

        {/* Ornament divider */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(28px,6vw,80px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${GL}0.28))` }} />
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <div style={{ width: 4, height: 4, background: `${GL}0.3)`, borderRadius: "50%" }} />
              <div style={{ width: 7, height: 7, border: `1px solid ${GL}0.45)`, transform: "rotate(45deg)" }} />
              <div style={{ width: 4, height: 4, background: `${GL}0.3)`, borderRadius: "50%" }} />
            </div>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${GL}0.28))` }} />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ padding: "clamp(14px,2vw,22px) clamp(28px,6vw,80px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ fontSize: "0.63rem", color: "rgba(26,26,26,0.3)", letterSpacing: "0.03em" }}>
              © {new Date().getFullYear()} Ana Alexandre · Todos os direitos reservados.
            </p>
            <p style={{ fontSize: "0.5rem", letterSpacing: "0.32em", textTransform: "uppercase", color: `${GL}0.5)` }}>by HARTEG</p>
            <div style={{ display: "flex", gap: "clamp(12px,2.5vw,28px)", flexWrap: "wrap" }}>
              {footerLegal.map(({ label }) => (
                <FLink key={label} to="/legal"
                  style={{ fontSize: "0.61rem", color: "rgba(26,26,26,0.3)", textDecoration: "none", letterSpacing: "0.03em", transition: "color 0.22s" }}
                  onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                  onMouseOut={e => (e.currentTarget.style.color = "rgba(26,26,26,0.3)")}
                >{label}</FLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
