import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Award, MapPin, Calendar, ExternalLink, ChevronRight } from "lucide-react";
import { FadeIn } from "../app/components/FadeIn";

// Real images from the artist
import imgProcess    from "figma:asset/6399465932709e595f6f97b150204568d9a0c14c.png";
import imgInstallFloor from "figma:asset/e6ea0ef70bf8ac9c274b680d74b6d0dfa80a65f1.png";
import imgAnaUnder   from "figma:asset/cd5e5be9bbc847f612d6eee464133e65f8dd8c6f.png";
import imgEyes       from "figma:asset/ebb5a35e5e40ac74234d1f58fb628000a9ca00b1.png";
import imgMarketCrowd from "figma:asset/3b08e0afa2ba39cc6be257854ede12f6f68096d3.png";
import imgAtelierWide from "figma:asset/216030aa6aaefa5e7f9facf26aaaa3f4d5ff33bf.png";
import imgOctopusClose from "figma:asset/8541df0425952db8221403f49b9cf0fd6b776313.png";
import imgAnaMarket  from "figma:asset/616e7e71ec3da1615a495603bb9d8ad200d1ca85.png";

const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#d4aa82";
const DARK       = "#1A1A1A";

const otherRecognitions = [
  {
    title: "3ª Bienal Internacional Mulheres D'Artes",
    venue: "Galerias Amadeo de Souza-Cardoso — Museu Municipal de Espinho",
    date:  "Abr–Ago 2015",
    note:  "Participação em bienal de referência internacional dedicada à arte feminina",
  },
  {
    title: "Prémio Mário Silva 2014",
    venue: "Centro de Artes e Espectáculos, Figueira da Foz",
    date:  "Mai–Jun 2014",
    note:  "Seleção e exposição no prémio regional de maior prestígio da região",
  },
  {
    title: "4º Salão Internacional de Arte em Pequeno Formato 20×20cm",
    venue: "Centro de Artes e Espectáculos, Figueira da Foz",
    date:  "Nov–Dez 2014",
    note:  "Participação no salão de formato restrito com presença internacional",
  },
];

/* ─────────────────────────────────────────────────────────── */
/*  ZoomImage — sempre visível na totalidade, height: auto     */
/* ─────────────────────────────────────────────────────────── */
function ZoomImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <div>
      <div style={{ overflow: "hidden", lineHeight: 0 }}>
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transition: "transform 1s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.03)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")
          }
        />
      </div>
      {caption && (
        <p
          style={{
            fontSize: "0.7rem",
            color: "#aaa",
            letterSpacing: "0.04em",
            fontStyle: "italic",
            marginTop: "8px",
            lineHeight: 1.55,
            paddingLeft: "2px",
            paddingBottom: "2px",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}

function GoldRule() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
      <div style={{ flex: 1, height: "1px", background: "rgba(196,149,106,0.25)" }} />
      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: GOLD_LIGHT }} />
      <div style={{ flex: 1, height: "1px", background: "rgba(196,149,106,0.25)" }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "0.65rem", letterSpacing: "0.32em", textTransform: "uppercase", color: GOLD, marginBottom: "12px" }}>
      {children}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════ */
export function PremioPage() {
  return (
    <div style={{ background: "#fafaf8", minHeight: "100vh" }}>

      {/* ════════════════════════════════════════════════════ */}
      {/*  PAGE HERO — imgAnaMarket como imagem de destaque    */}
      {/*  A escolha: Ana + polvo suspenso no mercado          */}
      {/*  A foto que conta a história toda numa só imagem     */}
      {/* ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>

        {/* Imagem de fundo — full-bleed */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imgAnaMarket})`,
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
          }}
        />

        {/* Gradiente — escurece só na parte de baixo para o texto */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Faixa dourada top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          }}
        />

        {/* Conteúdo de texto — sobre a imagem, em baixo */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px 72px",
            width: "100%",
          }}
        >
          {/* Back link */}
          <div style={{ position: "absolute", top: "-88vh", left: "24px" }}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = GOLD_LIGHT)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)")}
            >
              <ArrowLeft size={13} />
              Voltar à Montra
            </Link>
          </div>

          <FadeIn>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: GOLD_LIGHT,
                marginBottom: "20px",
              }}
            >
              Reconhecimento &amp; Prémios
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                color: "#fff",
                fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
                lineHeight: 1.0,
                marginBottom: "24px",
                maxWidth: "700px",
                textShadow: "0 2px 24px rgba(0,0,0,0.4)",
              }}
            >
              Medalha<br />
              <span style={{ color: GOLD_LIGHT }}>Criatividade</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.14}>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1rem, 2vw, 1.3rem)",
                color: "rgba(255,255,255,0.75)",
                fontStyle: "italic",
                marginBottom: "32px",
              }}
            >
              Instalação «Polvo Alegre» · Agosto 2014
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {[
                { icon: <Award size={12} />, text: "Prémio — Agosto de 2014" },
                { icon: <MapPin size={12} />, text: "Figueira da Foz, Portugal" },
                { icon: <Calendar size={12} />, text: "Exposição Peixeira da Figueira da Foz" },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 14px",
                    border: `1px solid rgba(196,149,106,0.5)`,
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(6px)",
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span style={{ color: GOLD_LIGHT }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/*  MODULE 1 — MEDALHA (Z-PATTERN)                     */}
      {/* ════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 0 80px", background: "#fafaf8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", marginBottom: "72px" }}>
          <GoldRule />
        </div>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>

            {/* Esquerda: medalha animada */}
            <FadeIn>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "-16px",
                    background: "linear-gradient(135deg, rgba(196,149,106,0.08) 0%, transparent 60%)",
                    pointerEvents: "none",
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                  style={{
                    background: "#fff",
                    padding: "40px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(196,149,106,0.12)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "28px",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.7, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      background: "conic-gradient(from 0deg, #b8864e, #e8b87a, #C4956A, #d4aa82, #b8864e, #e8c87a, #C4956A, #b8864e)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 16px 56px rgba(196,149,106,0.5), 0 4px 16px rgba(0,0,0,0.14)",
                    }}
                  >
                    <div
                      style={{
                        width: "158px",
                        height: "158px",
                        borderRadius: "50%",
                        background: "linear-gradient(145deg, #c8985c 0%, #e8c078 40%, #C4956A 70%, #a87848 100%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "inset 0 2px 10px rgba(0,0,0,0.18)",
                      }}
                    >
                      <Award size={40} color="rgba(255,255,255,0.92)" />
                      <p
                        style={{
                          fontSize: "0.55rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.88)",
                          textAlign: "center",
                          lineHeight: 1.4,
                        }}
                      >
                        Medalha<br />Criatividade
                      </p>
                    </div>
                  </motion.div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: "4px" }}>
                      Atribuída em Agosto 2014
                    </p>
                    <p style={{ fontSize: "0.82rem", color: "#aaa" }}>
                      Mercado Municipal Engenheiro Silva, Figueira da Foz
                    </p>
                  </div>
                </motion.div>
              </div>
            </FadeIn>

            {/* Direita: texto */}
            <FadeIn delay={0.15}>
              <div>
                <SectionLabel>O Reconhecimento</SectionLabel>
                <h2 style={{ fontFamily: "var(--font-serif)", color: DARK, fontSize: "clamp(1.5rem, 2.5vw, 2rem)", lineHeight: 1.2, marginBottom: "8px" }}>
                  Uma ode ao mar
                </h2>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#777", fontStyle: "italic", marginBottom: "28px" }}>
                  e à identidade costeira
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <p style={{ fontSize: "0.97rem", color: "#444", lineHeight: 1.88 }}>
                    A instalação «Polvo Alegre» foi criada no contexto da emblemática
                    Exposição Peixeira da Figueira da Foz, realizada no Mercado Municipal
                    Engenheiro Silva em agosto de 2014. A obra celebra a relação ancestral
                    da cidade atlântica com o mar e as suas gentes — os pescadores, as
                    peixeiras, a vida vibrante do cais.
                  </p>
                  <p style={{ fontSize: "0.97rem", color: "#555", lineHeight: 1.88 }}>
                    Através de formas orgânicas e paletas cromáticas exuberantes, Ana
                    Alexandre transpõe para a instalação a energia e a alegria do
                    quotidiano marítimo. O júri distinguiu a obra com a Medalha Criatividade
                    pelo seu carácter inovador e pela forma como interpela o espaço público.
                  </p>
                  <blockquote
                    style={{
                      fontSize: "0.9rem",
                      color: "#888",
                      lineHeight: 1.75,
                      borderLeft: `2px solid ${GOLD}`,
                      paddingLeft: "18px",
                      fontStyle: "italic",
                      margin: "8px 0 0",
                    }}
                  >
                    "A criatividade não conhece fronteiras — ela encontra matéria em
                    tudo o que nos rodeia, do mercado ao museu, do quotidiano ao sublime."
                    <span style={{ display: "block", marginTop: "8px", fontStyle: "normal", fontSize: "0.75rem", color: "#aaa", letterSpacing: "0.08em" }}>
                      — Ana Alexandre
                    </span>
                  </blockquote>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/*  MODULE 2 — GALERIA MASONRY                         */}
      {/*  2 colunas explícitas · height:auto · zero cortes   */}
      {/*  Coluna esq: panorâmicas + contexto                 */}
      {/*  Coluna dir: detalhes + retratos                    */}
      {/* ════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 0", background: "linear-gradient(180deg, #f5f0e8 0%, #faf7f2 100%)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

          <FadeIn>
            <div style={{ marginBottom: "56px" }}>
              <SectionLabel>A Obra</SectionLabel>
              <h2 style={{ fontFamily: "var(--font-serif)", color: DARK, fontSize: "clamp(1.6rem, 3vw, 2.3rem)", marginBottom: "16px" }}>
                Instalação «Polvo Alegre»
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#777", lineHeight: 1.75, maxWidth: "560px" }}>
                Estrutura tridimensional em tecido, costurada à mão, com materiais
                têxteis reciclados e elementos cromáticos inspirados no imaginário
                marítimo da Figueira da Foz.
              </p>
            </div>
          </FadeIn>

          {/* ── Masonry: 2 colunas explícitas ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", alignItems: "start" }}>

            {/* COLUNA ESQUERDA
                1. imgMarketCrowd  — landscape panorâmica (melões + público)
                2. imgAnaUnder     — retrato Ana de baixo
                3. imgAtelierWide  — landscape polvo no chão
            */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <FadeIn delay={0.06}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgMarketCrowd}
                    alt="Público a fotografar o Polvo Alegre — melões em primeiro plano"
                    caption="Mercado em plena actividade — o Polvo Alegre suspende o olhar do público, os melões em primeiro plano"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.14}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgAnaUnder}
                    alt="Ana Alexandre debaixo do polvo suspenso — perspectiva de baixo"
                    caption="Perspectiva ascendente — Ana Alexandre sob a instalação, a escala da obra em evidência"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.22}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgAtelierWide}
                    alt="O polvo deitado no atelier antes de ser suspenso"
                    caption="Antes da suspensão — a escala real da obra revelada no atelier"
                  />
                </div>
              </FadeIn>
            </div>

            {/* COLUNA DIREITA
                1. imgOctopusClose — retrato close-up do polvo (cores vivas)
                2. imgEyes         — detalhe olhos
                3. imgInstallFloor — Ana no atelier
            */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <FadeIn delay={0.1}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgOctopusClose}
                    alt="Vista de perto do polvo suspenso — tecido turquesa com bolinhas amarelas"
                    caption="Detalhe do corpo — tecido turquesa, vermelho e azul, bolinhas e pompons costurados à mão"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.18}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgEyes}
                    alt="Olhos da escultura — botões negros com pelúcia amarela"
                    caption="Os olhos — o detalhe mais expressivo, botões negros envolvidos em pelúcia amarela"
                  />
                </div>
              </FadeIn>
              <FadeIn delay={0.26}>
                <div style={{ border: "1px solid rgba(196,149,106,0.13)" }}>
                  <ZoomImage
                    src={imgInstallFloor}
                    alt="Ana Alexandre no atelier — fases finais da criação"
                    caption="O atelier — Ana Alexandre nas últimas fases, semanas de trabalho concentrado"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Ficha técnica */}
          <FadeIn delay={0.3}>
            <div
              style={{
                marginTop: "40px",
                padding: "32px 40px",
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(196,149,106,0.18)",
                display: "flex",
                gap: "48px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "Material", text: "Tecido, espuma e fio — costurados à mão durante semanas de trabalho contínuo." },
                { label: "Conceito", text: "O polvo como metáfora da criatividade: tentáculos que se estendem, exploram e abraçam." },
                { label: "Dimensão", text: "Instalação de grande escala — a obra preenche o mercado com cor, textura e movimento." },
              ].map((item) => (
                <div key={item.label} style={{ flex: "1", minWidth: "200px" }}>
                  <p style={{ fontSize: "0.62rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: "8px" }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.75, fontStyle: "italic" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/*  MODULE 3 — STORYTELLING FULL-WIDTH                 */}
      {/*  imgProcess como fundo (a artista a costurar)       */}
      {/* ════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "580px" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imgProcess})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundAttachment: "fixed",
            transform: "scale(1.02)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(26,26,26,0.82) 0%, rgba(26,26,26,0.70) 50%, rgba(180,130,80,0.18) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "860px",
            margin: "0 auto",
            padding: "100px 32px",
            textAlign: "center",
          }}
        >
          <FadeIn>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.4em", textTransform: "uppercase", color: GOLD_LIGHT, marginBottom: "24px" }}>
              O Processo
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.15, marginBottom: "32px" }}>
              The Art of Creation
            </h2>
          </FadeIn>
          <FadeIn delay={0.18}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", marginBottom: "40px" }}>
              {[
                { step: "01", label: "Problema",  text: "Dar vida ao imaginário marítimo" },
                { step: "02", label: "Material",  text: "Tecido costurado à mão, semanas de trabalho" },
                { step: "03", label: "Mudança",   text: "Instalação de grande escala num mercado real" },
                { step: "04", label: "Impacto",   text: "Medalha Criatividade — reconhecimento nacional" },
              ].map((item, i) => (
                <div key={item.step} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div style={{ textAlign: "center", padding: "20px 24px", maxWidth: "160px" }}>
                    <p style={{ fontSize: "0.58rem", letterSpacing: "0.22em", color: GOLD_LIGHT, marginBottom: "6px" }}>{item.step}</p>
                    <p style={{ fontFamily: "var(--font-serif)", color: "#fff", fontSize: "0.95rem", marginBottom: "6px" }}>{item.label}</p>
                    <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{item.text}</p>
                  </div>
                  {i < 3 && <ChevronRight size={16} color="rgba(196,149,106,0.5)" style={{ flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.28}>
            <p style={{ fontSize: "0.97rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.85, fontStyle: "italic", maxWidth: "600px", margin: "0 auto 48px" }}>
              "Cada ponto costurado é uma decisão artística. O processo criativo não termina
              no atelier — continua no espaço que a obra habita, nas pessoas que a encontram,
              na memória que deixa."
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/contactos"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "14px 36px", background: GOLD, color: "#fff",
                  fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  textDecoration: "none", transition: "background 0.3s, transform 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#b8864e"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = GOLD;      (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
              >
                Solicitar Exposição <ChevronRight size={14} />
              </Link>
              <Link
                to="/galeria"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "14px 36px", border: "1px solid rgba(255,255,255,0.4)",
                  color: "rgba(255,255,255,0.85)", fontSize: "0.75rem", letterSpacing: "0.18em",
                  textTransform: "uppercase", textDecoration: "none", background: "transparent",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent";            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)"; }}
              >
                Ver Galeria Completa
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ */}
      {/*  PARTICIPAÇÕES NOTÁVEIS                             */}
      {/* ════════════════════════════════════════════════════ */}
      <section id="participacoes" style={{ padding: "100px 0 110px", background: "#fafaf8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "64px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(196,149,106,0.2)" }} />
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, whiteSpace: "nowrap" }}>
                Participações Notáveis
              </p>
              <div style={{ flex: 1, height: "1px", background: "rgba(196,149,106,0.2)" }} />
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(196,149,106,0.15)" }}>
            {otherRecognitions.map((item, i) => (
              <FadeIn key={i} delay={0.08 * i}>
                <div
                  style={{ background: "#fafaf8", padding: "40px 36px", transition: "background 0.3s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f5f0e8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#fafaf8")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `linear-gradient(135deg, ${GOLD}, #e8c078)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ExternalLink size={13} color="#fff" />
                    </div>
                    <p style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD }}>
                      {item.date}
                    </p>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-serif)", color: DARK, fontSize: "1rem", lineHeight: 1.35, marginBottom: "10px" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#888", lineHeight: 1.65, marginBottom: "12px" }}>
                    {item.venue}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#aaa", lineHeight: 1.65, borderTop: "1px solid rgba(196,149,106,0.15)", paddingTop: "12px" }}>
                    {item.note}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div style={{ textAlign: "center", marginTop: "80px" }}>
              <Link
                to="/"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "14px 36px", border: `1px solid ${GOLD}`, color: GOLD,
                  fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  textDecoration: "none", borderRadius: "100px", transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = GOLD; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; (e.currentTarget as HTMLAnchorElement).style.color = GOLD; }}
              >
                <ArrowLeft size={14} />
                Voltar à Montra
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
