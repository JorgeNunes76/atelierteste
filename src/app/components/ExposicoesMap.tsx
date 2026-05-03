import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import React from "react";
import {
  ComposableMap, Geographies, Geography, Marker, ZoomableGroup,
} from "react-simple-maps";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Globe, MapPin, ChevronRight, List, Map as MapIcon,
  Calendar, Building2, Award, Info, MousePointer2, Filter,
  LayoutGrid, AlignLeft, TrendingUp, X,
} from "lucide-react";
import { FadeIn } from "./FadeIn";
import { Link } from "react-router-dom";

// ── GeoJSON ────────────────────────────────────────────────────
const geoUrls = {
  world: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",
  portugalDistricts: "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/portugal/portugal-districts.json",
  portugalConcelhos: "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/portugal/portugal-municipalities.json",
};

// ── Name maps (GeoJSON uses English) ──────────────────────────
const PT_TO_EN: Record<string, string> = {
  "Portugal": "Portugal", "Espanha": "Spain", "Alemanha": "Germany",
  "Rússia": "Russia", "Itália": "Italy", "Reino Unido": "United Kingdom",
  "França": "France", "Brasil": "Brazil",
};
const EN_TO_PT: Record<string, string> = Object.fromEntries(
  Object.entries(PT_TO_EN).map(([pt, en]) => [en, pt])
);

// Country flags (emoji)
const COUNTRY_FLAG: Record<string, string> = {
  "Portugal": "🇵🇹", "Espanha": "🇪🇸", "Alemanha": "🇩🇪",
  "Rússia": "🇷🇺", "Itália": "🇮🇹", "Reino Unido": "🇬🇧",
  "França": "🇫🇷", "Brasil": "🇧🇷",
};

// Country ISO codes for flag images
const COUNTRY_ISO: Record<string, string> = {
  "Portugal": "pt", "Espanha": "es", "Alemanha": "de",
  "Rússia": "ru", "Itália": "it", "Reino Unido": "gb",
  "França": "fr", "Brasil": "br",
};

const countryConfigs: Record<string, { scale: number; center: [number, number] }> = {
  "Portugal":    { scale: 3500, center: [-8.2, 39.5] },
  "Espanha":     { scale: 1400, center: [-3.7, 40.4] },
  "Alemanha":    { scale: 1600, center: [10.4, 51.1] },
  "Rússia":      { scale:  320, center: [60,   60  ] },
  "Itália":      { scale: 1600, center: [12.5, 42.0] },
  "Reino Unido": { scale: 1800, center: [-2.5, 54.0] },
  "França":      { scale: 1400, center: [ 2.5, 46.5] },
  "Brasil":      { scale:  380, center: [-52, -14  ] },
};

// ── Tokens ────────────────────────────────────────────────────
const GOLD      = "#C9A96E";
const GOLD_DARK = "#a87848";
const PIN_INTL  = "#e8935a";
const PIN_NAC   = "#C9A87C";
const SEPIA     = "#8B6E4E";

// World / non-PT country view — dark ocean
const MAP_OCEAN        = "#0d1b2a";
const MAP_LAND         = "#1e3145";
const MAP_LAND_HOVER   = "#2a4460";
const MAP_EXPO         = "#C9A96E";
const MAP_EXPO_HOVER   = "#d4a87a";
const MAP_EXPO_STROKE  = "#e0b880";
const MAP_LAND_STROKE  = "#2c4560";
// Portugal view — cream
const MAP_OCEAN_LIGHT       = "#d8cfbf";
const MAP_DISTRICT_BASE     = "#e8e0d0";
const MAP_DISTRICT_EXPO     = "#c8956a";
const MAP_DISTRICT_EXPO_HOV = "#d8a87a";
const MAP_DISTRICT_STROKE   = "#b8a888";

const catColor: Record<string, string> = {
  "Coletiva": "#6B8DB5", "Individual": "#7BAE8A",
  "Bienal": "#B57A6B", "Salão": "#9B84B5",
};

// ── Data types ─────────────────────────────────────────────────
interface Artwork {
  title: string; medium: string; year: number; dimensions?: string; image: string;
}
interface Exhibition {
  id: number; city: string; country: string; district?: string;
  venue: string; name: string; date: string; year: number;
  scope: "Nacional" | "Internacional";
  category: "Coletiva" | "Individual" | "Bienal" | "Salão";
  coords: [number, number];
  artworks?: Artwork[];
}

const exhibitions: Exhibition[] = [
  { id:  1, city: "Tomar",            country: "Portugal", district: "Santarém",        venue: "Casa Vieira Guimarães",                                name: "Liceu com Arte III",                                       date: "Out–Nov 2017",       year: 2017, scope: "Nacional",       category: "Coletiva",   coords: [-8.41,  39.60], artworks: [
    { title: "Obra AR3", medium: "Técnica mista sobre tela", year: 2017, dimensions: "80 × 60 cm", image: "https://images.unsplash.com/photo-1667980898743-fcfe470b7d2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbnRlbXBvcmFyeSUyMGFydCUyMHBhaW50aW5nJTIwY2FudmFzfGVufDF8fHx8MTc3MzA1ODc3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
    { title: "Fragmento Dourado", medium: "Óleo sobre tela", year: 2017, dimensions: "50 × 40 cm", image: "https://images.unsplash.com/photo-1761078739495-5a7984e9a1c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvaWwlMjBwYWludGluZyUyMGFic3RyYWN0JTIwdGV4dHVyZSUyMGdvbGQlMjB3YXJtfGVufDF8fHx8MTc3MzA1ODc3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ] },
  { id:  2, city: "Porto",            country: "Portugal", district: "Porto",            venue: "Galeria do Café Majestic",                             name: "A Arte pelo Tiaguinho",                                    date: "Fev–Mar 2017",       year: 2017, scope: "Nacional",       category: "Coletiva",   coords: [-8.61,  41.15] },
  { id:  3, city: "Porto",            country: "Portugal", district: "Porto",            venue: "Galeria de Arte 46",                                   name: "Exposição Coletiva de Pintura",                            date: "Dez 2016–Jan 2017",  year: 2016, scope: "Nacional",       category: "Coletiva",   coords: [-8.60,  41.16] },
  { id:  4, city: "Coimbra",          country: "Portugal", district: "Coimbra",          venue: "Galeria de Arte Torre Arnado",                         name: "A Arte de Victor Costa e Amigos #2 Enigma",               date: "Out–Nov 2016",       year: 2016, scope: "Nacional",       category: "Coletiva",   coords: [-8.42,  40.20] },
  { id:  5, city: "Tomar",            country: "Portugal", district: "Santarém",         venue: "Lagares del Rei",                                      name: "Liceu com Arte II",                                        date: "Out 2017",            year: 2017, scope: "Nacional",       category: "Coletiva",   coords: [-8.42,  39.61], artworks: [
    { title: "Obra AR3 — Variação II", medium: "Técnica mista sobre tela", year: 2017, dimensions: "70 × 50 cm", image: "https://images.unsplash.com/photo-1599140427277-7cbcb58180a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMG1lZGlhJTIwY29udGVtcG9yYXJ5JTIwYXJ0d29yayUyMHN0dWRpb3xlbnwxfHx8fDE3NzMwNTg3ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" },
  ] },
  { id:  6, city: "Porto",            country: "Portugal", district: "Porto",            venue: "Fundação Escultura José Rodrigues",                    name: "A Arte pelo Tiaguinho",                                    date: "Fev–Mar 2016",       year: 2016, scope: "Nacional",       category: "Coletiva",   coords: [-8.62,  41.14] },
  { id:  7, city: "Porto",            country: "Portugal", district: "Porto",            venue: "Galeria Clube dos Fenianos Portuenses",                name: "Mulheres — Escravas & Deusas II",                         date: "Dez 2015–Fev 2016",  year: 2016, scope: "Nacional",       category: "Coletiva",   coords: [-8.605, 41.145]},
  { id:  8, city: "Coimbra",          country: "Portugal", district: "Coimbra",          venue: "Particula — Espaço de Arte e Cultura",                name: "ARCA-EUAC",                                                date: "Nov–Dez 2015",       year: 2015, scope: "Nacional",       category: "Coletiva",   coords: [-8.43,  40.21] },
  { id:  9, city: "Tomar",            country: "Portugal", district: "Santarém",         venue: "Lagares d'el Rei",                                     name: "Liceu com Arte I",                                         date: "Out–Nov 2015",       year: 2015, scope: "Nacional",       category: "Coletiva",   coords: [-8.41,  39.59] },
  { id: 10, city: "Lisboa",           country: "Portugal", district: "Lisboa",           venue: "Museu da Carris",                                      name: "Mulheres — Escravas & Deusas II",                         date: "Set–Nov 2015",       year: 2015, scope: "Nacional",       category: "Coletiva",   coords: [-9.14,  38.72] },
  { id: 11, city: "Mangualde",        country: "Portugal", district: "Viseu",            venue: "Biblioteca Dr. Alexandre Alves",                       name: "Mulheres — Escravas & Deusas II",                         date: "Ago 2015",            year: 2015, scope: "Nacional",       category: "Coletiva",   coords: [-7.76,  40.60] },
  { id: 12, city: "Espinho",          country: "Portugal", district: "Aveiro",           venue: "Galerias Amadeo de Souza-Cardoso",                     name: "3ª Bienal Internacional Mulheres D'Artes",                date: "Abr–Ago 2015",       year: 2015, scope: "Nacional",       category: "Bienal",     coords: [-8.64,  41.01] },
  { id: 13, city: "Felgueiras",       country: "Portugal", district: "Porto",            venue: "Casa do Corvelo em Sousa",                             name: "Mulheres — Escravas & Deusas II",                         date: "Abr–Mai 2015",       year: 2015, scope: "Nacional",       category: "Coletiva",   coords: [-8.19,  41.37] },
  { id: 14, city: "Coimbra",          country: "Portugal", district: "Coimbra",          venue: "Recordatório Rainha Santa Isabel",                     name: "Fragmentação no Espaço",                                   date: "Nov 2014–Jan 2015",  year: 2014, scope: "Nacional",       category: "Individual", coords: [-8.41,  40.20] },
  { id: 15, city: "Figueira da Foz",  country: "Portugal", district: "Coimbra",          venue: "Centro de Artes e Espectáculos",                       name: "4º Salão Internacional Arte em Pequeno Formato",          date: "Nov–Dez 2014",       year: 2014, scope: "Nacional",       category: "Salão",      coords: [-8.86,  40.15] },
  { id: 16, city: "Viana do Castelo", country: "Portugal", district: "Viana do Castelo", venue: "Galeria do IPDJ",                                      name: "Pinceladas Outonais",                                      date: "Out 2014",            year: 2014, scope: "Nacional",       category: "Coletiva",   coords: [-8.83,  41.69] },
  { id: 17, city: "Caldas da Rainha", country: "Portugal", district: "Leiria",           venue: "Pavilhão Multiusos",                                   name: "ARTSHOW 2014",                                             date: "Set 2014",            year: 2014, scope: "Nacional",       category: "Coletiva",   coords: [-9.13,  39.40] },
  { id: 18, city: "Figueira da Foz",  country: "Portugal", district: "Coimbra",          venue: "Mercado Municipal Engenheiro Silva",                   name: "Peixeira da Figueira da Foz ⭐",                           date: "Ago–Out 2014",       year: 2014, scope: "Nacional",       category: "Coletiva",   coords: [-8.87,  40.16] },
  { id: 19, city: "Soure",            country: "Portugal", district: "Coimbra",          venue: "Biblioteca Municipal de Soure",                        name: "Caminhe Connosco",                                         date: "Jul 2014",            year: 2014, scope: "Nacional",       category: "Coletiva",   coords: [-8.63,  40.07] },
  { id: 20, city: "Góis",             country: "Portugal", district: "Coimbra",          venue: "Góis",                                                 name: "XVIII Edição Góis Oroso Arte 2014 — Dot.ART",             date: "Jul 2014",            year: 2014, scope: "Nacional",       category: "Coletiva",   coords: [-8.11,  40.16] },
  { id: 21, city: "Figueira da Foz",  country: "Portugal", district: "Coimbra",          venue: "Centro de Artes e Espectáculos",                       name: "Prémio Mário Silva 2014",                                  date: "Mai–Jun 2014",       year: 2014, scope: "Nacional",       category: "Salão",      coords: [-8.865, 40.14] },
  { id: 22, city: "Coimbra",          country: "Portugal", district: "Coimbra",          venue: "Casa da Madeira",                                      name: "Exposição Coletiva de Pintura",                            date: "Mar 1999",            year: 1999, scope: "Nacional",       category: "Coletiva",   coords: [-8.44,  40.19] },
  { id: 23, city: "Tomar",            country: "Portugal", district: "Santarém",         venue: "Biblioteca Municipal de Tomar",                        name: "Exposição Coletiva de Pintura/Desenho",                    date: "Mai 1993",            year: 1993, scope: "Nacional",       category: "Coletiva",   coords: [-8.40,  39.60] },
  { id: 24, city: "A Coruña",         country: "Espanha",                                venue: "Galeria Arte-Imagem",                                  name: "A Arte pelo Tiaguinho",                                    date: "Fev–Abr 2016",       year: 2016, scope: "Internacional", category: "Coletiva",   coords: [-8.41,  43.37] },
  { id: 25, city: "Berlim",           country: "Alemanha",                               venue: "Sala Omniculture",                                     name: "Exposição Coletiva de Pintura",                            date: "Abr 2016",            year: 2016, scope: "Internacional", category: "Coletiva",   coords: [13.40,  52.52] },
  { id: 26, city: "Moscovo",          country: "Rússia",                                 venue: "Galeria Central",                                      name: "Exposição Coletiva de Pintura e Escultura",               date: "Set–Out 2015",       year: 2015, scope: "Internacional", category: "Coletiva",   coords: [37.62,  55.75] },
  { id: 27, city: "Volgogrado",       country: "Rússia",                                 venue: "Museum of Fine Arts",                                  name: "Exposição Coletiva de Pintura e Escultura",               date: "Set 2015",            year: 2015, scope: "Internacional", category: "Coletiva",   coords: [44.52,  48.71] },
  { id: 28, city: "Spoleto",          country: "Itália",                                 venue: "Galleria d'Arte Spoletoarte",                          name: "Exposição Coletiva de Pintura e Escultura",               date: "Mai–Jun 2015",       year: 2015, scope: "Internacional", category: "Coletiva",   coords: [12.74,  42.73] },
  { id: 29, city: "Londres",          country: "Reino Unido",                            venue: "Galeria The Lane Brick",                               name: "Exposição Coletiva de Pintura",                            date: "Abr 2015",            year: 2015, scope: "Internacional", category: "Coletiva",   coords: [-0.12,  51.50] },
  { id: 30, city: "Paris",            country: "França",                                 venue: "Galeria de Arte Contemporânea de Paris",               name: "Exposição Coletiva",                                       date: "Jan 2015",            year: 2015, scope: "Internacional", category: "Coletiva",   coords: [ 2.35,  48.85] },
  { id: 31, city: "São Petersburgo",  country: "Rússia",                                 venue: "Galeria Central da União dos Artistas",                name: "Exposição Coletiva",                                       date: "Dez 2014–Jan 2015",  year: 2014, scope: "Internacional", category: "Coletiva",   coords: [30.32,  59.95] },
  { id: 32, city: "Brasil",           country: "Brasil",                                 venue: "Minas Gerais · Rio · Brasília (itinerante)",           name: "Europa, Brasil uma só Arte",                              date: "Nov 2014–Jul 2016",  year: 2014, scope: "Internacional", category: "Coletiva",   coords: [-47.93,-15.78] },
];

interface CityGroup {
  key: string; city: string; country: string; district?: string;
  coords: [number, number]; scope: "Nacional" | "Internacional";
  exhibitions: Exhibition[];
}
function groupByCityCountry(exs: Exhibition[]): CityGroup[] {
  const m = new Map<string, CityGroup>();
  for (const ex of exs) {
    const key = `${ex.city}|${ex.country}`;
    if (!m.has(key)) m.set(key, { key, city: ex.city, country: ex.country, district: ex.district, coords: ex.coords, scope: ex.scope, exhibitions: [] });
    m.get(key)!.exhibitions.push(ex);
  }
  return Array.from(m.values());
}

type MapLevel = "world" | "country" | "district";
interface NavState { level: MapLevel; country: string | null; district: string | null; zoom: number; center: [number, number]; }
type PanelView = "list" | "cards" | "timeline";

// ── Mini components ───────────────────────────────────────────

function CategoryBadge({ cat }: { cat: string }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", background: `${catColor[cat] || "#888"}18`, color: catColor[cat] || "#888", fontSize: "0.52rem", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 20, border: `1px solid ${catColor[cat] || "#888"}28` }}>{cat}</span>;
}

function StatPill({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 14px", background: "#C4956A0F", borderRadius: 8, border: "1px solid #C4956A1F" }}>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: color || GOLD, lineHeight: 1, marginBottom: 3 }}>{value}</p>
      <p style={{ fontSize: "0.52rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>{label}</p>
    </div>
  );
}

// Full exhibition card (screen 2 country view)
function ExhibitionCard({ ex, accent }: { ex: Exhibition; accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: "#fff", border: "1px solid #0000000D", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 16px #0000000D" }}
    >
      {/* Accent strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#1a1a1a", lineHeight: 1.35, flex: 1 }}>
            {ex.name.replace(" ⭐", "")}
            {ex.name.includes("⭐") && <span style={{ color: GOLD, marginLeft: 4 }}>★</span>}
          </p>
          <CategoryBadge cat={ex.category} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={11} color="#ccc" />
            <span style={{ fontSize: "0.72rem", color: "#777" }}>{ex.venue}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={11} color="#ccc" />
            <span style={{ fontSize: "0.72rem", color: "#777" }}>{ex.city}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={11} color={accent} />
            <span style={{ fontSize: "0.72rem", color: accent }}>{ex.date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// District card for Portugal view
function DistrictCard({ district, count, cities, maxCount, isActive, onClick, onMouseEnter, onMouseLeave }: {
  district: string; count: number; cities: string[]; maxCount: number;
  isActive?: boolean; onClick: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void;
}) {
  const [hov, setHov] = useState(false);
  const pct = Math.round((count / maxCount) * 100);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHov(true); onMouseEnter?.(); }}
      onMouseLeave={() => { setHov(false); onMouseLeave?.(); }}
      style={{ width: "100%", textAlign: "left", border: "none", cursor: "pointer", background: isActive ? `${GOLD}0c` : hov ? "#faf7f4" : "transparent", padding: "14px 16px", borderLeft: `3px solid ${isActive || hov ? GOLD : "transparent"}`, transition: "all 0.18s", minHeight: 52 } as any}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MapPin size={13} color={isActive || hov ? GOLD : "#ccc"} style={{ flexShrink: 0, transition: "color 0.2s" }} />
          <span style={{ fontSize: "0.82rem", color: isActive ? "#1a1a1a" : "#333", transition: "color 0.2s" }}>{district}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: "0.65rem", color: isActive || hov ? "#fff" : SEPIA, background: isActive || hov ? GOLD : "#f0ebe4", padding: "2px 8px", borderRadius: 20, fontWeight: 600, transition: "all 0.2s" }}>{count}</span>
          <ChevronRight size={12} color={hov ? GOLD : "#ddd"} style={{ transition: "color 0.2s" }} />
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: "#C4956A1A", borderRadius: 2, overflow: "hidden", marginLeft: 21 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{ height: "100%", background: isActive || hov ? GOLD : "#C4956A66", borderRadius: 2 }}
        />
      </div>
      <p style={{ fontSize: "0.62rem", color: "#bbb", marginTop: 4, marginLeft: 21, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {cities.slice(0, 3).join(" · ")}{cities.length > 3 ? ` +${cities.length - 3}` : ""}
      </p>
    </button>
  );
}

// Simple list item for world view
function ListItem({ icon, label, sub, count, isActive, onClick, onMouseEnter, onMouseLeave }: {
  icon?: React.ReactNode; label: string; sub?: string; count: number;
  isActive?: boolean; onClick: () => void; onMouseEnter?: () => void; onMouseLeave?: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => { setHov(true); onMouseEnter?.(); }} onMouseLeave={() => { setHov(false); onMouseLeave?.(); }}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: isActive ? `${GOLD}14` : hov ? "#faf7f4" : "transparent", border: "none", cursor: "pointer", textAlign: "left", borderLeft: `3px solid ${isActive ? GOLD : hov ? `${GOLD}55` : "transparent"}`, transition: "all 0.18s", minHeight: 52 }}>
      {icon && <span style={{ flexShrink: 0, color: isActive ? GOLD : "#bbb" }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.85rem", color: isActive ? "#1a1a1a" : "#333", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</p>
        {sub && <p style={{ fontSize: "0.68rem", color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ background: isActive ? GOLD : "#f0ebe4", color: isActive ? "#fff" : SEPIA, fontSize: "0.65rem", padding: "3px 8px", borderRadius: 20, fontWeight: 600, transition: "all 0.2s" }}>{count}</span>
        <ChevronRight size={14} color={hov ? GOLD : "#ddd"} style={{ transition: "color 0.2s" }} />
      </div>
    </button>
  );
}

// Step badge in breadcrumb
function StepBadge({ n, label, active, done, onClick }: { n: number; label: string; active: boolean; done: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: onClick ? "pointer" : "default", padding: 0, minHeight: 32 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? GOLD : active ? "#1a1a1a" : "#00000012", border: `1.5px solid ${done ? GOLD : active ? "#1a1a1a" : "#0000001F"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
        {done ? <span style={{ color: "#fff", fontSize: "0.48rem" }}>✓</span> : <span style={{ fontSize: "0.5rem", color: active ? "#fff" : "#bbb" }}>{n}</span>}
      </div>
      <span style={{ fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: active ? "#1a1a1a" : done ? GOLD : "#bbb", transition: "color 0.3s", whiteSpace: "nowrap", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────
export function ExposicoesMap() {
  const [nav, setNav] = useState<NavState>({ level: "world", country: null, district: null, zoom: 1, center: [10, 20] });
  const [selectedCity, setSelectedCity] = useState<CityGroup | null>(null);
  const [hoveredGeo, setHoveredGeo] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<{ city: string; x: number; y: number } | null>(null);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");
  const [hoverTooltip, setHoverTooltip] = useState<{ x: number; y: number; label: string; count: number; clickable: boolean } | null>(null);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("list");
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [windowWidth, setWindowWidth] = useState(() => typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);
  const isMobile = windowWidth < 768;

  // Stable callback — disable ALL d3-zoom user interaction (pan, wheel-zoom, dblclick-zoom)
  // so the page scrolls normally and clicks on markers/geographies work unimpeded.
  // Programmatic center/zoom changes via nav state still work (bypass the filter).
  const filterZoomEvent = useCallback(() => false, []);

  // ── Data ───────────────────────────────────────────────────
  const nationais      = useMemo(() => exhibitions.filter(e => e.scope === "Nacional"), []);
  const internacionais = useMemo(() => exhibitions.filter(e => e.scope === "Internacional"), []);
  const nationalGroups      = useMemo(() => groupByCityCountry(nationais), [nationais]);
  const internationalGroups = useMemo(() => groupByCityCountry(internacionais), [internacionais]);
  const expoCountriesPT = useMemo(() => new Set(exhibitions.map(e => e.country)), []);
  const expoCountriesEN = useMemo(() => new Set([...expoCountriesPT].map(pt => PT_TO_EN[pt] || pt)), [expoCountriesPT]);

  const countriesWithExpos = useMemo(() => {
    const m = new Map<string, { country: string; count: number; cities: string[] }>();
    m.set("Portugal", { country: "Portugal", count: nationais.length, cities: [...new Set(nationais.map(e => e.city))] });
    for (const ex of internacionais) {
      if (!m.has(ex.country)) m.set(ex.country, { country: ex.country, count: 0, cities: [] });
      const e = m.get(ex.country)!;
      e.count++;
      if (!e.cities.includes(ex.city)) e.cities.push(ex.city);
    }
    return Array.from(m.values());
  }, [nationais, internacionais]);

  const districtsWithExpos = useMemo(() => {
    const m = new Map<string, { district: string; count: number; cities: string[] }>();
    for (const ex of nationais) {
      if (!ex.district) continue;
      if (!m.has(ex.district)) m.set(ex.district, { district: ex.district, count: 0, cities: [] });
      const e = m.get(ex.district)!;
      e.count++;
      if (!e.cities.includes(ex.city)) e.cities.push(ex.city);
    }
    return Array.from(m.values()).sort((a, b) => b.count - a.count);
  }, [nationais]);

  const maxDistrictCount = useMemo(() => Math.max(...districtsWithExpos.map(d => d.count)), [districtsWithExpos]);

  // Country exhibitions (filtered by year if set)
  const countryExhibitions = useMemo(() => {
    if (!nav.country) return [];
    const all = exhibitions.filter(e => e.country === nav.country);
    return yearFilter ? all.filter(e => e.year === yearFilter) : all;
  }, [nav.country, yearFilter]);

  // Available years for current country
  const availableYears = useMemo(() => {
    if (!nav.country) return [];
    return [...new Set(exhibitions.filter(e => e.country === nav.country).map(e => e.year))].sort((a, b) => b - a);
  }, [nav.country]);

  // Cities / districts for current context
  const currentCountryCities = useMemo(() => {
    const exs = nav.level === "district" && nav.district
      ? countryExhibitions.filter(e => e.district === nav.district)
      : countryExhibitions;
    return groupByCityCountry(exs);
  }, [countryExhibitions, nav.level, nav.district, nav.country]);

  // Country stats
  const countryStats = useMemo(() => {
    if (!nav.country) return null;
    const exs = exhibitions.filter(e => e.country === nav.country);
    const years = exs.map(e => e.year);
    const cities = [...new Set(exs.map(e => e.city))];
    const cats = exs.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {} as Record<string, number>);
    return { total: exs.length, cities: cities.length, yearMin: Math.min(...years), yearMax: Math.max(...years), cats };
  }, [nav.country]);

  // Markers
  const visibleMarkers = useMemo(() => {
    const all = [...nationalGroups, ...internationalGroups];
    if (nav.level === "world") return all;
    if (nav.level === "country") return all.filter(g => g.country === nav.country);
    if (nav.level === "district") return all.filter(g => g.country === nav.country && g.district === nav.district);
    return [];
  }, [nav.level, nav.country, nav.district, nationalGroups, internationalGroups]);

  // District centroids for labels on Portugal map
  const districtCentroids = useMemo(() => {
    const m = new Map<string, { coords: [number, number]; count: number; label: string }>();
    for (const ex of nationais) {
      if (!ex.district) continue;
      if (!m.has(ex.district)) m.set(ex.district, { coords: [ex.coords[0], ex.coords[1]], count: 1, label: ex.district });
      else {
        const e = m.get(ex.district)!;
        e.coords[0] = (e.coords[0] * e.count + ex.coords[0]) / (e.count + 1);
        e.coords[1] = (e.coords[1] * e.count + ex.coords[1]) / (e.count + 1);
        e.count++;
      }
    }
    return m;
  }, [nationais]);

  // Projection
  const scaleFactor = isMobile ? 0.55 : 1;
  const isDarkMap = nav.level === "world" || nav.level === "country";

  const projectionConfig = useMemo(() => {
    if (nav.level === "world") return { scale: isMobile ? 120 : 170, center: [0, 15] as [number, number] };
    const cfg = countryConfigs[nav.country || ""] || countryConfigs["Portugal"];
    return { scale: Math.round(cfg.scale * scaleFactor), center: cfg.center };
  }, [nav.level, nav.country, isMobile, scaleFactor]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (nav.level === "world") return [0, 15];
    return (countryConfigs[nav.country || ""] || countryConfigs["Portugal"]).center;
  }, [nav.level, nav.country]);

  const mapViewBox  = isMobile ? "0 30 460 310" : "50 60 850 460";
  const mapViewKey  = nav.level === "world" ? "world" : nav.level === "country" ? `c-${nav.country}` : `d-${nav.district}`;

  // ── Navigation ─────────────────────────────────────────────
  function drillIntoCountry(country: string) {
    if (!countryConfigs[country]) return;
    setSelectedCity(null); setHoveredGeo(null); setHoverTooltip(null);
    setYearFilter(null); setPanelView("list");
    setNav({ level: "country", country, district: null, zoom: 1, center: countryConfigs[country].center });
    if (isMobile) setMobileTab("list");
  }
  function drillIntoDistrict(district: string) {
    const exs = exhibitions.filter(e => e.district === district);
    const center: [number, number] = exs.length > 0 ? exs[0].coords : [-8, 39];
    setSelectedCity(null); setHoveredGeo(null); setHoverTooltip(null); setYearFilter(null);
    setNav(prev => ({ ...prev, level: "district", district, zoom: 2.8, center }));
  }
  function goBack() {
    setSelectedCity(null); setHoveredGeo(null); setHoverTooltip(null); setYearFilter(null);
    if (nav.level === "district") setNav(prev => ({ ...prev, level: "country", district: null, zoom: 1 }));
    else if (nav.level === "country") setNav({ level: "world", country: null, district: null, zoom: 1, center: [10, 20] });
  }
  function goToWorld() { setSelectedCity(null); setYearFilter(null); setNav({ level: "world", country: null, district: null, zoom: 1, center: [10, 20] }); }
  function goToCountry() { if (!nav.country) return; setSelectedCity(null); setYearFilter(null); setNav(prev => ({ ...prev, level: "country", district: null, zoom: 1 })); }

  function handleGeoClick(geo: any) {
    const engName = geo.properties.name || geo.properties.NAME_1 || geo.properties.NAME;
    if (nav.level === "world") {
      const ptName = EN_TO_PT[engName] || engName;
      if (expoCountriesPT.has(ptName) && countryConfigs[ptName]) drillIntoCountry(ptName);
    }
  }

  function handleMarkerClick(group: CityGroup) {
    if (nav.level === "world") drillIntoCountry(group.country);
    else { setSelectedCity(prev => prev?.key === group.key ? null : group); if (isMobile) setMobileTab("list"); }
  }

  // Mouse tracking for tooltip
  const handleMapMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current || !hoveredGeo) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    setHoverTooltip(prev => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
  }, [hoveredGeo]);

  // ── Geo style ──────────────────────────────────────────────
  function getGeoStyle(geo: any) {
    const engName = geo.properties.name || geo.properties.NAME_1 || geo.properties.NAME;
    const ptName  = EN_TO_PT[engName] || engName;
    const isHov   = engName === hoveredGeo;

    if (isDarkMap) {
      const hasExpos    = expoCountriesEN.has(engName);
      const isClickable = hasExpos && !!countryConfigs[ptName];
      // When in country view, spotlight the selected country
      const isSelected  = nav.level === "country" && (engName === PT_TO_EN[nav.country!] || engName === nav.country);
      const fill = isSelected
        ? (isHov ? "#d4aa7a" : MAP_EXPO)
        : nav.level === "country"
          ? (hasExpos ? "#2a3d50" : "#182430") // dim others in country view
          : hasExpos ? (isHov ? MAP_EXPO_HOVER : MAP_EXPO) : (isHov ? MAP_LAND_HOVER : MAP_LAND);
      const strokeW = isSelected ? 1.2 : nav.level === "country" ? 0.2 : (hasExpos ? 0.7 : 0.3);
      const stroke  = isSelected ? MAP_EXPO_STROKE : hasExpos ? MAP_EXPO_STROKE : MAP_LAND_STROKE;
      const cursor  = isClickable || (nav.level === "country" && isSelected) ? "pointer" : "default";
      return { fill, stroke, strokeW, cursor, hasExpos, isClickable: isClickable || (nav.level === "country" && isSelected), ptName };
    } else {
      // Portugal district/concelho view (cream)
      const hasExpos  = exhibitions.some(e =>
        (nav.level === "country" && e.district === engName) ||
        (nav.level === "district" && e.city === engName)
      );
      const isHovDist = engName === hoveredGeo;
      const fill   = hasExpos ? (isHovDist ? MAP_DISTRICT_EXPO_HOV : MAP_DISTRICT_EXPO) : (isHovDist ? "#ddd5c5" : MAP_DISTRICT_BASE);
      const stroke = MAP_DISTRICT_STROKE;
      return { fill, stroke, strokeW: 0.5, cursor: "pointer", hasExpos, isClickable: true, ptName };
    }
  }

  // Panel key
  const panelKey = selectedCity ? `city-${selectedCity.key}` : nav.level === "district" ? `dist-${nav.district}` : nav.level === "country" ? `cntry-${nav.country}-${yearFilter}` : "world";

  const countryAccent = nav.country ? GOLD : GOLD;
  const countryFlag   = nav.country ? (COUNTRY_FLAG[nav.country] || "🌍") : "���";

  // ── Render ──────────────────────��──────────────────────────
  return (
    <section style={{ background: "linear-gradient(160deg, #faf7f2 0%, #f5f0e8 60%, #f0ebe0 100%)", padding: isMobile ? "48px 0 36px" : "100px 0 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", border: "1px solid #C4956A14", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: isMobile ? "0 12px" : "0 32px" }}>

        {/* ── Header ── */}
        <FadeIn>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-end", marginBottom: 8, rowGap: isMobile ? 12 : 16, columnGap: isMobile ? 12 : 16 }}>
            <div>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>Presença Internacional</p>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", marginBottom: 0, fontSize: isMobile ? "1.35rem" : undefined }}>Exposições pelo Mundo</h2>
            </div>
            <div style={{ display: "flex", gap: isMobile ? 16 : 24, alignItems: isMobile ? "center" : "flex-end", paddingBottom: isMobile ? 0 : 4 }}>
              <div style={{ textAlign: isMobile ? "center" : "right" }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? "1.4rem" : "1.8rem", color: PIN_INTL, lineHeight: 1, marginBottom: 3 }}>{internacionais.length}</p>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>Internacionais</p>
              </div>
              <div style={{ width: 1, height: isMobile ? 28 : 36, background: "#C4956A33" }} />
              <div style={{ textAlign: isMobile ? "center" : "right" }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? "1.4rem" : "1.8rem", color: SEPIA, lineHeight: 1, marginBottom: 3 }}>{nationais.length}</p>
                <p style={{ fontSize: "0.55rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa" }}>Nacionais</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: isMobile ? 14 : 24 }}>
            <div style={{ width: isMobile ? 32 : 48, height: 1, background: GOLD }} />
            <div style={{ flex: 1, height: 1, background: "#C4956A26" }} />
          </div>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", columnGap: isMobile ? 5 : 8, rowGap: isMobile ? 8 : 8, marginBottom: isMobile ? 14 : 20, flexWrap: "wrap" }}>
            <StepBadge n={1} label="Mundo"                       active={nav.level === "world"}   done={nav.level !== "world"}   onClick={nav.level !== "world" ? goToWorld : undefined} />
            <div style={{ width: isMobile ? 12 : 20, height: 1, background: "#0000001A" }} />
            <StepBadge n={2} label={nav.country || "País"}        active={nav.level === "country"} done={nav.level === "district"} onClick={nav.level === "district" ? goToCountry : undefined} />
            {nav.country === "Portugal" && nav.level === "district" && (
              <>
                <div style={{ width: isMobile ? 12 : 20, height: 1, background: "#0000001A" }} />
                <StepBadge n={3} label={nav.district || "Distrito"} active={nav.level === "district"} done={false} />
              </>
            )}
            {nav.level !== "world" && (
              <button onClick={goBack} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#1a1a1a", border: "none", color: "#fff", cursor: "pointer", padding: isMobile ? "8px 14px" : "8px 16px", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", borderRadius: 100, transition: "opacity 0.2s", minHeight: 36 }}>
                <ArrowLeft size={11} /> Voltar
              </button>
            )}
          </div>
        </FadeIn>

        {/* ── Two-panel layout ── */}
        <FadeIn delay={0.1}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", border: "1px solid #C4956A2E", overflow: "hidden", boxShadow: "0 8px 48px #00000024, 0 2px 12px #C4956A14", borderRadius: isMobile ? 8 : 0 }}>

            {/* ══ MOBILE TABS — outside map for better accessibility ══ */}
            {isMobile && (
              <div style={{ display: "flex", background: "#faf7f2", borderBottom: "1px solid #C4956A20" }}>
                {(["map", "list"] as const).map(tab => (
                  <button key={tab} onClick={() => setMobileTab(tab)}
                    style={{
                      flex: 1, padding: "12px 16px", border: "none", cursor: "pointer",
                      background: mobileTab === tab ? "#fff" : "transparent",
                      color: mobileTab === tab ? "#1a1a1a" : "#999",
                      fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.2s",
                      borderBottom: mobileTab === tab ? `2px solid ${GOLD}` : "2px solid transparent",
                      minHeight: 48,
                    }}>
                    {tab === "map" ? <MapIcon size={14} /> : <List size={14} />}
                    {tab === "map" ? "Mapa" : "Lista"}
                  </button>
                ))}
              </div>
            )}

            {/* ══ MAP ══ */}
            <div ref={mapContainerRef} onMouseMove={handleMapMouseMove} onMouseLeave={() => { setHoveredGeo(null); setHoverTooltip(null); }}
              style={{ flex: 1, position: "relative", minHeight: isMobile ? 340 : 500, display: isMobile && mobileTab === "list" ? "none" : "block", background: isDarkMap ? MAP_OCEAN : MAP_OCEAN_LIGHT }}
            >

              {/* Country spotlight overlay */}
              <AnimatePresence>
                {nav.level === "country" && (
                  <motion.div key={`spotlight-${nav.country}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 2, pointerEvents: "none",
                      background: `radial-gradient(ellipse at 40% 50%, transparent 30%, #0D1B2A80 100%)` }}
                  />
                )}
              </AnimatePresence>

              {/* Animated map */}
              <AnimatePresence mode="wait">
                <motion.div key={mapViewKey}
                  initial={{ opacity: 0, scale: nav.level === "world" ? 1.02 : 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                  style={{ display: mobileTab === "list" && isMobile ? "none" : "block" }}
                >
                  <ComposableMap projectionConfig={projectionConfig}
                    style={{ width: "100%", height: "auto", outline: "none", display: "block" }}
                    viewBox={mapViewBox}
                  >
                    <rect width={mapViewBox.split(" ")[2]} height={mapViewBox.split(" ")[3]} fill={isDarkMap ? MAP_OCEAN : MAP_OCEAN_LIGHT} onClick={() => setSelectedCity(null)} />
                    <ZoomableGroup zoom={nav.zoom} center={mapCenter}
                      filterZoomEvent={filterZoomEvent}
                    >
                      <Geographies geography={
                        nav.level === "district" && nav.country === "Portugal" ? geoUrls.portugalConcelhos :
                        geoUrls.world
                      }>
                        {({ geographies }) =>
                          geographies
                            .filter(geo => nav.level === "district" ? geo.properties.NAME_1 === nav.district : true)
                            .map(geo => {
                              const engName = geo.properties.name || geo.properties.NAME_1 || geo.properties.NAME;
                              const { fill, stroke, strokeW, cursor, hasExpos, isClickable, ptName } = getGeoStyle(geo);
                              const distExpoCount = 0;
                              return (
                                <Geography key={geo.rsmKey} geography={geo}
                                  fill={fill} stroke={stroke} strokeWidth={strokeW}
                                  onClick={() => isClickable && handleGeoClick(geo)}
                                  onMouseEnter={(e) => {
                                    setHoveredGeo(engName);
                                    if (mapContainerRef.current) {
                                      const rect = mapContainerRef.current.getBoundingClientRect();
                                      const me = e as unknown as React.MouseEvent;
                                      const count = hasExpos && nav.level === "world"
                                        ? (countriesWithExpos.find(c => c.country === ptName)?.count ?? 0)
                                        : distExpoCount || 0;
                                      const displayName = nav.level === "world" ? (ptName || engName) : (geo.properties.NAME_1 || engName);
                                      setHoverTooltip({ x: me.clientX - rect.left, y: me.clientY - rect.top, label: displayName, count, clickable: !!isClickable });
                                    }
                                  }}
                                  onMouseLeave={() => { setHoveredGeo(null); setHoverTooltip(null); }}
                                  style={{ default: { outline: "none", fill, cursor, transition: "fill 0.2s ease" }, hover: { outline: "none", fill, cursor }, pressed: { outline: "none", fill } }}
                                />
                              );
                            })
                        }
                      </Geographies>

                      {/* District count labels on Portugal map (district level only) */}
                      {nav.level === "district" && nav.country === "Portugal" && (
                        <AnimatePresence>
                          {Array.from(districtCentroids.entries()).map(([district, data]) => {
                            const expoInfo = districtsWithExpos.find(d => d.district === district);
                            if (!expoInfo) return null;
                            return (
                              <Marker key={`lbl-${district}`} coordinates={data.coords as [number, number]}>
                                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }} style={{ pointerEvents: "none" }}>
                                  <rect x={-16} y={-10} width={32} height={18} rx={4} fill="#0D1B2AB8" />
                                  <text x={0} y={3} textAnchor="middle" fontSize={7.5} fill="#fff" fontFamily="var(--font-sans)" fontWeight="600">{expoInfo.count}</text>
                                </motion.g>
                              </Marker>
                            );
                          })}
                        </AnimatePresence>
                      )}

                      {/* Markers */}
                      <AnimatePresence>
                        {visibleMarkers.map(group => {
                          const isActive = selectedCity?.key === group.key;
                          const pinColor = group.scope === "Internacional" ? PIN_INTL : PIN_NAC;
                          const baseR    = nav.level === "world" ? (group.scope === "Internacional" ? 5.5 : 4) : (group.scope === "Internacional" ? 4.5 : 3.2);
                          const r  = baseR / (nav.zoom || 1);
                          const sw = 1 / (nav.zoom || 1);
                          return (
                            <Marker key={group.key} coordinates={group.coords}
                              onClick={e => { (e as any).stopPropagation?.(); handleMarkerClick(group); }}
                              style={{ cursor: "pointer", outline: "none" }}
                            >
                              <motion.g 
                                initial={{ opacity: 0, scale: 0 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0 }}
                                whileHover={{ scale: 1.55 }} 
                                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                                onMouseEnter={(e: any) => {
                                  if (nav.level !== "world" && mapContainerRef.current) {
                                    const rect = mapContainerRef.current.getBoundingClientRect();
                                    setHoveredCity({ 
                                      city: group.city, 
                                      x: e.clientX - rect.left, 
                                      y: e.clientY - rect.top 
                                    });
                                  }
                                }}
                                onMouseLeave={() => setHoveredCity(null)}
                              >
                                {/* Ripple waves when active/selected */}
                                {isActive && (
                                  <>
                                    <circle r={r} fill="none" stroke={pinColor} strokeWidth={sw * 1.2} opacity={0}>
                                      <animate attributeName="r" values={`${r};${r*4};${r*4}`} dur="1.8s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="0.6;0;0" dur="1.8s" repeatCount="indefinite" />
                                    </circle>
                                    <circle r={r} fill="none" stroke={pinColor} strokeWidth={sw * 0.8} opacity={0}>
                                      <animate attributeName="r" values={`${r};${r*3.2};${r*3.2}`} dur="1.8s" begin="0.6s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="0.5;0;0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
                                    </circle>
                                    <circle r={r} fill="none" stroke={pinColor} strokeWidth={sw * 0.5} opacity={0}>
                                      <animate attributeName="r" values={`${r};${r*2.4};${r*2.4}`} dur="1.8s" begin="1.2s" repeatCount="indefinite" />
                                      <animate attributeName="opacity" values="0.4;0;0" dur="1.8s" begin="1.2s" repeatCount="indefinite" />
                                    </circle>
                                  </>
                                )}
                                {/* Subtle ambient pulse (world view) */}
                                {!isActive && nav.level === "world" && group.scope === "Internacional" && (
                                  <circle r={r} fill="none" stroke={pinColor} strokeWidth={sw * 0.3} opacity={0}>
                                    <animate attributeName="r" values={`${r};${r*3.2};${r}`} dur="3.5s" begin="0.8s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0;0.3;0" dur="3.5s" begin="0.8s" repeatCount="indefinite" />
                                  </circle>
                                )}
                                {!isActive && nav.level === "world" && (
                                  <circle r={r} fill="none" stroke={pinColor} strokeWidth={sw * 0.4} opacity={0}>
                                    <animate attributeName="r" values={`${r};${r*2.4};${r}`} dur={group.scope === "Internacional" ? "3s" : "4s"} repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.3;0;0.3" dur={group.scope === "Internacional" ? "3s" : "4s"} repeatCount="indefinite" />
                                  </circle>
                                )}
                                {/* Pin dot — always keeps original color */}
                                <circle r={r} fill={pinColor} stroke={isActive ? "#fff" : "#FFFFFFEB"} strokeWidth={isActive ? sw * 1.5 : sw * 1} />
                                {group.scope === "Internacional" && <circle r={r * 0.38} fill="#fff" />}
                                {group.exhibitions.length > 1 && (
                                  <text x={r * 1.65} y={-r * 0.15} fontSize={r * 1.55} fill={isDarkMap ? "#fff" : "#1a1a1a"} fontFamily="var(--font-serif)" fontWeight="900" style={{ pointerEvents: "none" }}>
                                    {group.exhibitions.length}
                                  </text>
                                )}
                              </motion.g>
                            </Marker>
                          );
                        })}
                      </AnimatePresence>
                    </ZoomableGroup>
                  </ComposableMap>
                </motion.div>
              </AnimatePresence>

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoverTooltip && (
                  <motion.div key="tt" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    style={{ position: "absolute", left: hoverTooltip.x, top: hoverTooltip.y, transform: "translate(-50%, calc(-100% - 14px))", zIndex: 40, pointerEvents: "none" }}
                  >
                    <div style={{ background: isDarkMap ? "#060E16F5" : "#FAF7F2F7", border: `1px solid ${hoverTooltip.clickable ? GOLD : "#FFFFFF1A"}`, backdropFilter: "blur(12px)", borderRadius: 8, padding: "8px 13px", boxShadow: "0 8px 32px #0000004D", minWidth: 120 }}>
                      {hoverTooltip.clickable && <div style={{ position: "absolute", top: 0, left: "14px", right: "14px", height: "2px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, borderRadius: "0 0 2px 2px" }} />}
                      <p style={{ fontSize: "0.75rem", color: isDarkMap ? "#fff" : "#1a1a1a", marginBottom: hoverTooltip.count > 0 ? 3 : 0 }}>{hoverTooltip.label}</p>
                      {hoverTooltip.count > 0 && <p style={{ fontSize: "0.62rem", color: GOLD }}>{hoverTooltip.count} exposição{hoverTooltip.count !== 1 ? "s" : ""}</p>}
                      {hoverTooltip.clickable && <p style={{ fontSize: "0.52rem", color: isDarkMap ? "#FFFFFF66" : "#bbb", marginTop: 3, display: "flex", alignItems: "center", gap: 3 }}><MousePointer2 size={8} /> clique para explorar</p>}
                    </div>
                    <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${hoverTooltip.clickable ? GOLD : (isDarkMap ? "#060E16F5" : "#FAF7F2F7")}` }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* City hover tooltip */}
              <AnimatePresence>
                {hoveredCity && (
                  <motion.div 
                    key="city-tt" 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{ 
                      position: "absolute", 
                      left: hoveredCity.x, 
                      top: hoveredCity.y, 
                      transform: "translate(-50%, calc(-100% - 18px))", 
                      zIndex: 50, 
                      pointerEvents: "none" 
                    }}
                  >
                    <div style={{ 
                      background: "linear-gradient(135deg, #C9A96EF8 0%, #B89860F8 100%)", 
                      backdropFilter: "blur(10px)", 
                      borderRadius: 6, 
                      padding: "6px 12px", 
                      boxShadow: "0 4px 24px #0000003A",
                      border: "1px solid #FFFFFF35"
                    }}>
                      <p style={{ 
                        fontSize: "0.72rem", 
                        color: "#fff", 
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        textShadow: "0 1px 2px #00000028"
                      }}>
                        {hoveredCity.city}
                      </p>
                    </div>
                    <div style={{ 
                      position: "absolute", 
                      bottom: -4, 
                      left: "50%", 
                      transform: "translateX(-50%)", 
                      width: 0, 
                      height: 0, 
                      borderLeft: "4px solid transparent", 
                      borderRight: "4px solid transparent", 
                      borderTop: "4px solid #B89860F8" 
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location pill */}
              <AnimatePresence>
                {nav.level !== "world" && (
                  <motion.div key={`loc-${mapViewKey}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                    style={{ position: "absolute", top: isMobile ? 8 : 12, left: "50%", transform: "translateX(-50%)", zIndex: 15, display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "5px 12px" : "6px 14px", background: "#FAF7F2F5", backdropFilter: "blur(8px)", border: "1px solid #C4956A38", borderRadius: 100, pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "0 2px 12px #00000014" }}>
                    <Globe size={isMobile ? 9 : 10} color={GOLD} />
                    <span style={{ fontSize: isMobile ? "0.5rem" : "0.55rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>
                      {nav.district ? `${nav.district} · ${nav.country}` : nav.country}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div style={{ position: "absolute", bottom: isMobile ? 6 : 14, right: isMobile ? 6 : 14, zIndex: 10, background: isDarkMap ? "#060E18ED" : "#FAF7F2F9", backdropFilter: "blur(14px)", border: `1px solid ${isDarkMap ? "#C4956A55" : "#C4956A44"}`, padding: isMobile ? "8px 12px" : "12px 16px", borderRadius: isMobile ? 8 : 10, display: "flex", flexDirection: "column", gap: isMobile ? 7 : 9, boxShadow: "0 6px 28px #00000029", minWidth: isMobile ? 140 : 160 }}>

                {/* Header label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: isMobile ? 4 : 5, borderBottom: `1px solid ${isDarkMap ? "#FFFFFF18" : "#C4956A28"}` }}>
                  <div style={{ width: 14, height: 1, background: isDarkMap ? "#C4956A80" : "#C4956A60" }} />
                  <span style={{ fontSize: isMobile ? "0.44rem" : "0.46rem", letterSpacing: "0.16em", textTransform: "uppercase", color: isDarkMap ? "#C4956A99" : "#A07840AA", fontWeight: 600 }}>Legenda</span>
                  <div style={{ flex: 1, height: 1, background: isDarkMap ? "#C4956A80" : "#C4956A60" }} />
                </div>

                {/* Com exposições */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 3, background: MAP_EXPO, flexShrink: 0, boxShadow: `0 0 6px ${MAP_EXPO}66` }} />
                  <div>
                    <div style={{ fontSize: isMobile ? "0.5rem" : "0.52rem", letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMap ? MAP_EXPO : GOLD_DARK, lineHeight: 1.2 }}>Com exposições</div>
                    <div style={{ fontSize: isMobile ? "0.42rem" : "0.44rem", letterSpacing: "0.04em", color: isDarkMap ? "#FFFFFF50" : "#A0784060", lineHeight: 1.2 }}>País destacado no mapa</div>
                  </div>
                </div>

                <div style={{ height: 1, background: isDarkMap ? "#FFFFFF0D" : "#C4956A18" }} />

                {/* Internacional */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0, overflow: "visible" }}>
                    <circle cx="7" cy="7" r="8" fill="none" stroke={PIN_INTL} strokeWidth="0.6" opacity="0.18">
                      <animate attributeName="r" values="5;10;5" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.22;0;0.22" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="7" cy="7" r="4.5" fill={PIN_INTL} stroke="#FFFFFFD9" strokeWidth="1.1" />
                    <circle cx="7" cy="7" r="1.6" fill="#FFFFFFD9" />
                  </svg>
                  <div>
                    <div style={{ fontSize: isMobile ? "0.5rem" : "0.52rem", letterSpacing: "0.08em", textTransform: "uppercase", color: PIN_INTL, lineHeight: 1.2 }}>Internacional</div>
                    <div style={{ fontSize: isMobile ? "0.42rem" : "0.44rem", letterSpacing: "0.04em", color: isDarkMap ? "#FFFFFF50" : "#A0784060", lineHeight: 1.2 }}>Exposição no estrangeiro</div>
                  </div>
                </div>

                <div style={{ height: 1, background: isDarkMap ? "#FFFFFF0D" : "#C4956A18" }} />

                {/* Nacional */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="4" fill={PIN_NAC} stroke="#FFFFFFD9" strokeWidth="1.1" />
                  </svg>
                  <div>
                    <div style={{ fontSize: isMobile ? "0.5rem" : "0.52rem", letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMap ? "#C9A87C" : SEPIA, lineHeight: 1.2 }}>Nacional</div>
                    <div style={{ fontSize: isMobile ? "0.42rem" : "0.44rem", letterSpacing: "0.04em", color: isDarkMap ? "#FFFFFF50" : "#A0784060", lineHeight: 1.2 }}>Exposição em Portugal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══ CONTEXT PANEL ══ */}
            <div style={{ width: isMobile ? "100%" : 340, flexShrink: 0, borderLeft: isMobile ? "none" : "1px solid #C4956A24", borderTop: isMobile ? "1px solid #C4956A20" : "none", background: "#fff", display: isMobile && mobileTab === "map" ? "none" : "flex", flexDirection: "column", minHeight: isMobile ? 380 : 500, maxHeight: isMobile ? "65vh" : undefined }}>



              {/* Panel sub-header (world / country / district / city) */}
              <AnimatePresence mode="wait">
                <motion.div key={`phdr-${panelKey}`}
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ padding: isMobile ? "14px 16px 12px" : "16px 20px 14px", borderBottom: "1px solid #C4956A14", background: "linear-gradient(to right, #faf7f2, #fff)", flexShrink: 0 }}
                >
                  {selectedCity ? (
                    <div>
                      <button onClick={() => setSelectedCity(null)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, padding: 0 }}>
                        <ArrowLeft size={10} /> Voltar à lista
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <MapPin size={14} color={selectedCity.scope === "Internacional" ? PIN_INTL : PIN_NAC} />
                        <div>
                          <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1rem" }}>{selectedCity.city}</p>
                          <p style={{ fontSize: "0.65rem", color: "#aaa" }}>{selectedCity.country}{selectedCity.district ? ` · ${selectedCity.district}` : ""} · {selectedCity.exhibitions.length} exp.</p>
                        </div>
                      </div>
                    </div>
                  ) : nav.level === "world" ? (
                    <div>
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>Selecione um país</p>
                      <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1rem" }}>Países com Exposições</p>
                      <p style={{ fontSize: "0.68rem", color: "#999", marginTop: 4 }}>Clique num país abaixo ou diretamente no mapa</p>
                    </div>
                  ) : nav.level === "country" && !selectedCity ? (
                    <div>
                      <button
                        onClick={goBack}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, padding: 0, transition: "color 0.2s" }}
                        onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                        onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
                      >
                        <ArrowLeft size={10} /> Voltar ao Mundo
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <img
                          src={`https://flagcdn.com/w40/${COUNTRY_ISO[nav.country || ""] || "xx"}.png`}
                          alt={nav.country || ""}
                          style={{ width: 28, height: 20, objectFit: "cover", borderRadius: 3, boxShadow: "0 1px 3px #00000020", flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1rem", lineHeight: 1.2 }}>{nav.country}</p>
                          {countryStats && (
                            <p style={{ fontSize: "0.65rem", color: "#aaa", marginTop: 2 }}>
                              {countryStats.total} exposiç{countryStats.total !== 1 ? "ões" : "ão"} · {countryStats.cities} cidad{countryStats.cities !== 1 ? "es" : "e"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : nav.level === "district" ? (
                    <div>
                      <button
                        onClick={goBack}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, padding: 0, transition: "color 0.2s" }}
                        onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                        onMouseOut={e => (e.currentTarget.style.color = "#aaa")}
                      >
                        <ArrowLeft size={10} /> Voltar a Portugal
                      </button>
                      <p style={{ fontSize: "0.55rem", letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, marginBottom: 4 }}>{nav.district} · Portugal</p>
                      <p style={{ fontFamily: "var(--font-serif)", color: "#1a1a1a", fontSize: "1rem" }}>Cidades do Distrito</p>
                      <p style={{ fontSize: "0.68rem", color: "#999", marginTop: 4 }}>Clique numa cidade para ver as exposições</p>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* ── Panel body ── */}
              <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                <AnimatePresence mode="wait">
                  <motion.div key={panelKey}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.24 }}
                  >
                    {/* City detail */}
                    {selectedCity && (
                      <div style={{ padding: "0 16px 16px" }}>
                        {selectedCity.exhibitions.map((ex, i) => (
                          <div key={ex.id} style={{ padding: "14px 0", borderBottom: i === selectedCity.exhibitions.length - 1 ? "none" : "1px solid #0000000D" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                              <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.88rem", color: "#1a1a1a", lineHeight: 1.3, flex: 1 }}>
                                {ex.name.replace(" ⭐", "")}{ex.name.includes("⭐") && <span style={{ color: GOLD, marginLeft: 4 }}>★</span>}
                              </p>
                              <CategoryBadge cat={ex.category} />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Building2 size={10} color="#bbb" /><span style={{ fontSize: "0.72rem", color: "#888" }}>{ex.venue}</span></div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={10} color={GOLD} /><span style={{ fontSize: "0.7rem", color: GOLD }}>{ex.date}</span></div>
                            </div>
                            {/* Artworks gallery */}
                            {ex.artworks && ex.artworks.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                <p style={{ fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                                  <span style={{ width: 16, height: 1, background: GOLD, display: "inline-block" }} />
                                  Obras em destaque
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  {ex.artworks.map((art, ai) => (
                                    <motion.div key={ai}
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.35, delay: 0.15 + ai * 0.1 }}
                                      style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #C4956A22", background: "#faf7f2" }}
                                    >
                                      <div style={{ position: "relative", width: "100%", height: 140, overflow: "hidden" }}>
                                        <img src={art.image} alt={art.title}
                                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                        />
                                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "50%", background: "linear-gradient(to top, #0D1B2A99, transparent)", pointerEvents: "none" }} />
                                        <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                          <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "#fff", textShadow: "0 1px 4px #00000066" }}>{art.title}</p>
                                          <span style={{ fontSize: "0.55rem", color: "#FFFFFFAA", flexShrink: 0 }}>{art.year}</span>
                                        </div>
                                      </div>
                                      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                                        <p style={{ fontSize: "0.65rem", color: "#888" }}>{art.medium}</p>
                                        {art.dimensions && <p style={{ fontSize: "0.6rem", color: "#bbb" }}>{art.dimensions}</p>}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* World: country list */}
                    {!selectedCity && nav.level === "world" && (
                      <div>
                        {countriesWithExpos.map(({ country, count, cities }) => (
                          <ListItem
                            key={country}
                            icon={
                              <img
                                src={`https://flagcdn.com/w40/${COUNTRY_ISO[country] || "xx"}.png`}
                                alt={country}
                                style={{ width: 22, height: 16, objectFit: "cover", borderRadius: 2, boxShadow: "0 1px 3px #00000020", flexShrink: 0 }}
                              />
                            }
                            label={country}
                            sub={cities.slice(0, 3).join(", ") + (cities.length > 3 ? "…" : "")}
                            count={count}
                            onClick={() => drillIntoCountry(country)}
                            onMouseEnter={() => setHoveredGeo(PT_TO_EN[country] || country)}
                            onMouseLeave={() => setHoveredGeo(null)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Country — LIST view */}
                    {!selectedCity && nav.level === "country" && panelView === "list" && (
                      <div style={{ paddingTop: 4 }}>
                        {currentCountryCities.map(group => (
                          <ListItem key={group.key} icon={<MapPin size={14} />} label={group.city}
                            sub={group.exhibitions[0].venue} count={group.exhibitions.length}
                            isActive={selectedCity?.key === group.key}
                            onClick={() => setSelectedCity(group)}
                            onMouseEnter={() => setHoveredGeo(group.city)}
                            onMouseLeave={() => setHoveredGeo(null)} />
                        ))}
                        {currentCountryCities.length === 0 && yearFilter && (
                          <div style={{ padding: "24px 20px", textAlign: "center" }}>
                            <p style={{ fontSize: "0.78rem", color: "#bbb" }}>Sem exposições em {yearFilter}</p>
                            <button onClick={() => setYearFilter(null)} style={{ marginTop: 8, fontSize: "0.62rem", color: GOLD, background: "none", border: "none", cursor: "pointer" }}>Ver todos os anos</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Country — CARDS view */}
                    {!selectedCity && nav.level === "country" && panelView === "cards" && (
                      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {countryExhibitions.map(ex => (
                          <ExhibitionCard key={ex.id} ex={ex} accent={GOLD} />
                        ))}
                        {countryExhibitions.length === 0 && yearFilter && (
                          <div style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ fontSize: "0.78rem", color: "#bbb" }}>Sem exposições em {yearFilter}</p>
                            <button onClick={() => setYearFilter(null)} style={{ marginTop: 8, fontSize: "0.62rem", color: GOLD, background: "none", border: "none", cursor: "pointer" }}>Ver todos</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Country — TIMELINE view */}
                    {!selectedCity && nav.level === "country" && panelView === "timeline" && (
                      <div style={{ padding: "16px 20px" }}>
                        {availableYears.filter(y => !yearFilter || y === yearFilter).map(year => {
                          const yearExs = countryExhibitions.filter(e => e.year === year);
                          if (yearExs.length === 0) return null;
                          return (
                            <div key={year} style={{ marginBottom: 20 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                                <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: GOLD, fontWeight: 600 }}>{year}</span>
                                <div style={{ flex: 1, height: 1, background: "#C4956A26" }} />
                                <span style={{ fontSize: "0.58rem", color: "#bbb" }}>{yearExs.length} exp.</span>
                              </div>
                              <div style={{ marginLeft: 20, borderLeft: "1px solid #C4956A26", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                                {yearExs.map(ex => (
                                  <div key={ex.id} style={{ background: "#faf7f2", borderRadius: 8, padding: "10px 12px", border: "1px solid #C4956A1A" }}>
                                    <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "#1a1a1a", marginBottom: 4, lineHeight: 1.3 }}>
                                      {ex.name.replace(" ⭐", "")}{ex.name.includes("⭐") && <span style={{ color: GOLD, marginLeft: 4 }}>★</span>}
                                    </p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: "0.62rem", color: "#888" }}>{ex.city}</span>
                                      <span style={{ color: "#ddd" }}>·</span>
                                      <span style={{ fontSize: "0.62rem", color: "#888" }}>{ex.venue}</span>
                                      <span style={{ color: "#ddd" }}>·</span>
                                      <CategoryBadge cat={ex.category} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* District: cities */}
                    {!selectedCity && nav.level === "district" && (
                      <div style={{ paddingTop: 4 }}>
                        {currentCountryCities.length > 0 ? currentCountryCities.map(group => (
                          <ListItem key={group.key} icon={<MapPin size={14} />} label={group.city}
                            sub={group.exhibitions[0].venue} count={group.exhibitions.length}
                            isActive={selectedCity?.key === group.key}
                            onClick={() => setSelectedCity(group)}
                            onMouseEnter={() => setHoveredGeo(group.city)}
                            onMouseLeave={() => setHoveredGeo(null)} />
                        )) : (
                          <div style={{ padding: "32px 20px", textAlign: "center" }}>
                            <Info size={24} color={GOLD} style={{ margin: "0 auto 12px" }} />
                            <p style={{ fontSize: "0.78rem", color: "#888" }}>Sem exposições neste distrito.</p>
                            <button onClick={goBack} style={{ marginTop: 12, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.1em", color: GOLD, border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <ArrowLeft size={10} /> Voltar a Portugal
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>


            </div>
          </div>
        </FadeIn>

        {/* Step guide */}
        <FadeIn delay={0.2}>
          <div style={{ marginTop: isMobile ? 12 : 18, display: "flex", flexWrap: isMobile ? "nowrap" : "wrap", rowGap: 8, columnGap: 8, justifyContent: isMobile ? "flex-start" : "center", overflowX: isMobile ? "auto" : undefined, WebkitOverflowScrolling: "touch", paddingBottom: isMobile ? 4 : 0, scrollbarWidth: "none" } as React.CSSProperties}>
            {[
              { step: "1", text: nav.level === "world" ? (isMobile ? "Toque num país" : "Clique num país dourado no mapa") : `País: ${nav.country}`, done: nav.level !== "world" },
              { step: "2", text: nav.level === "country" && nav.country === "Portugal" ? "Escolha um distrito" : nav.level === "country" ? (isMobile ? "Escolha uma cidade" : "Escolha uma cidade ou mude a vista") : nav.country ? `A explorar ${nav.country}` : "Escolha um país", done: nav.level === "district" || (nav.level === "country" && !!selectedCity) },
              { step: "3", text: selectedCity ? `${selectedCity.exhibitions.length} exp. em ${selectedCity.city}` : nav.level === "district" ? "Clique numa cidade" : "Ver exposições", done: !!selectedCity },
            ].map(({ step, text, done }) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 6, padding: isMobile ? "6px 12px" : "7px 14px", background: done ? "rgba(196,149,106,0.08)" : "rgba(0,0,0,0.03)", border: `1px solid ${done ? "rgba(196,149,106,0.22)" : "rgba(0,0,0,0.06)"}`, borderRadius: 100, whiteSpace: "nowrap", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? GOLD : "rgba(0,0,0,0.07)", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.48rem", color: done ? "#fff" : "#999" }}>{done ? "✓" : step}</span>
                </div>
                <span style={{ fontSize: isMobile ? "0.58rem" : "0.62rem", color: done ? GOLD_DARK : "#888", letterSpacing: "0.06em" }}>{text}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Award button below map */}
        <FadeIn delay={0.3}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: isMobile ? 20 : 28 }}>
            <Link
              to="/premio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: isMobile ? "12px 20px" : "14px 28px",
                border: `1px solid ${GOLD}`,
                background: GOLD,
                color: "#fff",
                textDecoration: "none",
                fontSize: isMobile ? "0.62rem" : "0.67rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                transition: "all 0.3s",
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background = "#faf7f2";
                (e.currentTarget as HTMLElement).style.color = GOLD;
                (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}55`;
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background = GOLD;
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.borderColor = GOLD;
              }}
            >
              <Award size={13} style={{ flexShrink: 0 }} />
              Peixeira da Figueira da Foz, 2014 · Medalha Criatividade
              <span style={{ opacity: 0.6, fontSize: "0.9em" }}>↗</span>
            </Link>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
