import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Switch from "@radix-ui/react-switch";
import * as Slider from "@radix-ui/react-slider";
import * as Select from "@radix-ui/react-select";

import { GOLD } from "../../lib/tokens";

export interface FilterState {
  techniques: string[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  themes: string[];
  availableOnly: boolean;
}

interface ArtworkFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
  sortBy: string;
  itemCount: number;
}

const TECHNIQUES = [
  { id: "oil", label: "Óleo sobre Tela" },
  { id: "acrylic", label: "Acrílico" },
  { id: "watercolor", label: "Aguarela" },
  { id: "mixed", label: "Técnica Mista" },
  { id: "drawing", label: "Desenho" },
];

const SIZES = [
  { id: "small", label: "Pequeno", description: "até 60cm" },
  { id: "medium", label: "Médio", description: "60-100cm" },
  { id: "large", label: "Grande", description: "100-150cm" },
  { id: "oversized", label: "Monumental", description: "+150cm" },
];

const COLORS = [
  { id: "black", label: "Preto", hex: "#000000" },
  { id: "white", label: "Branco", hex: "#FFFFFF" },
  { id: "blue", label: "Azul", hex: "#1E3A8A" },
  { id: "red", label: "Vermelho", hex: "#991B1B" },
  { id: "brown", label: "Terra", hex: "#78350F" },
  { id: "green", label: "Verde", hex: "#166534" },
  { id: "yellow", label: "Amarelo", hex: "#CA8A04" },
  { id: "purple", label: "Roxo", hex: "#6B21A8" },
  { id: "gray", label: "Cinza", hex: "#52525B" },
];

const THEMES = [
  { id: "abstract", label: "Abstrato" },
  { id: "portrait", label: "Retrato" },
  { id: "landscape", label: "Paisagem" },
  { id: "figurative", label: "Figurativo" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mais Recente" },
  { value: "oldest", label: "Mais Antigo" },
  { value: "price-asc", label: "Preço: Baixo a Alto" },
  { value: "price-desc", label: "Preço: Alto a Baixo" },
  { value: "title", label: "Título A-Z" },
];

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/[0.04]">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        type="button"
        className="w-full flex items-center justify-between py-6 text-left group hover:bg-black/[0.01] transition-colors px-5"
      >
        <span className="text-[0.7rem] tracking-[0.12em] uppercase" style={{ color: isOpen ? GOLD : "#666" }}>
          {title}
        </span>
        <ChevronDown
          size={14}
          className="transition-all duration-500 ease-out"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            color: isOpen ? GOLD : "#999",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-7 px-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ArtworkFilters({
  filters,
  onChange,
  onSortChange,
  sortBy,
  itemCount,
}: ArtworkFiltersProps) {
  const [showFilters, setShowFilters] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(filters.priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(filters.priceRange[1].toString());

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleTechnique = (id: string) => {
    const newTechniques = filters.techniques.includes(id)
      ? filters.techniques.filter((t) => t !== id)
      : [...filters.techniques, id];
    onChange({ ...filters, techniques: newTechniques });
  };

  const toggleSize = (id: string) => {
    const newSizes = filters.sizes.includes(id)
      ? filters.sizes.filter((s) => s !== id)
      : [...filters.sizes, id];
    onChange({ ...filters, sizes: newSizes });
  };

  const toggleColor = (id: string) => {
    const newColors = filters.colors.includes(id)
      ? filters.colors.filter((c) => c !== id)
      : [...filters.colors, id];
    onChange({ ...filters, colors: newColors });
  };

  const toggleTheme = (id: string) => {
    const newThemes = filters.themes.includes(id)
      ? filters.themes.filter((t) => t !== id)
      : [...filters.themes, id];
    onChange({ ...filters, themes: newThemes });
  };

  const updatePriceRange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    onChange({ ...filters, priceRange: newRange });
    setMinPrice(values[0].toString());
    setMaxPrice(values[1].toString());
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);
    const num = parseInt(value) || 0;
    if (num <= filters.priceRange[1]) {
      onChange({ ...filters, priceRange: [num, filters.priceRange[1]] });
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxPrice(value);
    const num = parseInt(value) || 5000;
    if (num >= filters.priceRange[0]) {
      onChange({ ...filters, priceRange: [filters.priceRange[0], num] });
    }
  };

  const activeFilterCount =
    filters.techniques.length +
    filters.sizes.length +
    filters.colors.length +
    filters.themes.length +
    (filters.availableOnly ? 1 : 0);

  const FilterContent = () => (
    <>
      {/* Technique */}
      <AccordionSection title="Técnica" defaultOpen={true}>
        <div className="space-y-3">
          {TECHNIQUES.map((tech) => (
            <label key={tech.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox.Root
                checked={filters.techniques.includes(tech.id)}
                onCheckedChange={() => toggleTechnique(tech.id)}
                className="w-5 h-5 border border-black/20 flex items-center justify-center transition-all hover:border-black/40"
                style={{
                  backgroundColor: filters.techniques.includes(tech.id)
                    ? "#1a1a1a"
                    : "transparent",
                }}
              >
                <Checkbox.Indicator>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-[0.85rem] text-[#666] group-hover:text-[#1a1a1a] transition-colors">
                {tech.label}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Size */}
      <AccordionSection title="Dimensões" defaultOpen={true}>
        <div className="space-y-2">
          {SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => toggleSize(size.id)}
              className="w-full px-4 py-3 text-left rounded border transition-all flex items-center justify-between"
              style={{
                backgroundColor: filters.sizes.includes(size.id)
                  ? "#1a1a1a"
                  : "transparent",
                borderColor: filters.sizes.includes(size.id)
                  ? "#1a1a1a"
                  : "rgba(0,0,0,0.15)",
                color: filters.sizes.includes(size.id) ? "#fff" : "#666",
              }}
            >
              <span className="text-[0.8rem] tracking-[0.04em]">{size.label}</span>
              <span
                className="text-[0.7rem]"
                style={{
                  opacity: filters.sizes.includes(size.id) ? 0.8 : 0.5,
                }}
              >
                {size.description}
              </span>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Dominant Color */}
      <AccordionSection title="Cor Predominante" defaultOpen={true}>
        <div className="grid grid-cols-5 gap-3">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => toggleColor(color.id)}
              className="relative w-full aspect-square rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: color.hex,
                border:
                  color.hex === "#FFFFFF"
                    ? "1px solid rgba(0,0,0,0.15)"
                    : "1px solid transparent",
                boxShadow: filters.colors.includes(color.id)
                  ? `0 0 0 2px ${GOLD}`
                  : "none",
              }}
              title={color.label}
            >
              {filters.colors.includes(color.id) && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      color.hex === "#FFFFFF" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.3)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13 4L6 11L3 8"
                      stroke={color.hex === "#FFFFFF" ? "#1a1a1a" : "#fff"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* Price Range */}
      <AccordionSection title="Preço" defaultOpen={true}>
        <div className="space-y-4">
          <Slider.Root
            min={0}
            max={5000}
            step={50}
            value={filters.priceRange}
            onValueChange={updatePriceRange}
            className="relative flex items-center select-none touch-none w-full h-10 md:h-5 cursor-pointer"
          >
            <Slider.Track className="bg-black/10 relative grow rounded-full h-[5px] md:h-[3px]">
              <Slider.Range
                className="absolute rounded-full h-full"
                style={{ backgroundColor: GOLD }}
              />
            </Slider.Track>
            <Slider.Thumb
              className="block w-7 h-7 md:w-5 md:h-5 bg-white border-2 rounded-full hover:scale-110 active:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform shadow-md"
              style={{ borderColor: GOLD, outlineColor: GOLD }}
            />
            <Slider.Thumb
              className="block w-7 h-7 md:w-5 md:h-5 bg-white border-2 rounded-full hover:scale-110 active:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform shadow-md"
              style={{ borderColor: GOLD, outlineColor: GOLD }}
            />
          </Slider.Root>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.7rem] tracking-[0.08em] uppercase text-[#999] mb-2">
                Min €
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="w-full px-3 py-2 text-[0.85rem] border border-black/10 rounded focus:outline-none focus:border-black/30 transition-colors"
                style={{ background: "#fafaf8" }}
              />
            </div>
            <div>
              <label className="block text-[0.7rem] tracking-[0.08em] uppercase text-[#999] mb-2">
                Max €
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full px-3 py-2 text-[0.85rem] border border-black/10 rounded focus:outline-none focus:border-black/30 transition-colors"
                style={{ background: "#fafaf8" }}
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Theme */}
      <AccordionSection title="Tema" defaultOpen={true}>
        <div className="space-y-3">
          {THEMES.map((theme) => (
            <label key={theme.id} className="flex items-center gap-3 cursor-pointer group">
              <Checkbox.Root
                checked={filters.themes.includes(theme.id)}
                onCheckedChange={() => toggleTheme(theme.id)}
                className="w-5 h-5 border border-black/20 flex items-center justify-center transition-all hover:border-black/40"
                style={{
                  backgroundColor: filters.themes.includes(theme.id)
                    ? "#1a1a1a"
                    : "transparent",
                }}
              >
                <Checkbox.Indicator>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3L4.5 8.5L2 6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-[0.85rem] text-[#666] group-hover:text-[#1a1a1a] transition-colors">
                {theme.label}
              </span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {/* Availability */}
      <AccordionSection title="Disponibilidade" defaultOpen={true}>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-[0.85rem] text-[#666]">Mostrar apenas disponíveis</span>
          <Switch.Root
            checked={filters.availableOnly}
            onCheckedChange={(checked) => onChange({ ...filters, availableOnly: checked })}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{
              backgroundColor: filters.availableOnly ? GOLD : "#d0d0d0",
            }}
          >
            <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[26px] shadow-sm" />
          </Switch.Root>
        </label>
      </AccordionSection>
    </>
  );

  // Desktop view
  if (!isMobile) {
    return (
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center gap-4 justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-[0.75rem] tracking-[0.08em] uppercase transition-colors"
            style={{ color: GOLD }}
          >
            <SlidersHorizontal size={16} />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>

          <Select.Root value={sortBy} onValueChange={onSortChange}>
            <Select.Trigger className="flex items-center gap-2 px-4 py-2 text-[0.75rem] tracking-[0.08em] uppercase border border-black/10 hover:border-black/20 transition-colors">
              <Select.Value />
              <ChevronDown size={14} />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="overflow-hidden bg-white rounded shadow-lg border border-black/10">
                <Select.Viewport className="p-1">
                  {SORT_OPTIONS.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="text-[0.85rem] rounded flex items-center px-6 py-3 relative select-none cursor-pointer outline-none hover:bg-black/5 data-[highlighted]:bg-black/5"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="sticky top-28">
                <div className="bg-white border border-black/[0.06] rounded-sm overflow-hidden">
                  <FilterContent />
                </div>
                <div className="mt-4 text-[0.75rem] text-[#aaa] text-center">
                  {itemCount} {itemCount === 1 ? "obra" : "obras"}
                  {activeFilterCount > 0 && ` · ${activeFilterCount} filtros ativos`}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile view
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 text-[0.75rem] tracking-[0.08em] uppercase border border-black/10 hover:border-black/20 transition-colors relative"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[0.65rem] flex items-center justify-center"
              style={{ backgroundColor: GOLD }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <Select.Root value={sortBy} onValueChange={onSortChange}>
          <Select.Trigger className="flex items-center justify-center gap-2 px-4 py-3 text-[0.75rem] tracking-[0.08em] uppercase border border-black/10 hover:border-black/20 transition-colors">
            <Select.Value />
            <ChevronDown size={14} />
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded shadow-lg border border-black/10 z-[100]">
              <Select.Viewport className="p-1">
                {SORT_OPTIONS.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className="text-[0.85rem] rounded flex items-center px-6 py-3 relative select-none cursor-pointer outline-none hover:bg-black/5 data-[highlighted]:bg-black/5"
                  >
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      {/* Mobile Filter Overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />

            {/* Filter Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 bg-[#fafaf8] z-50 rounded-t-2xl shadow-2xl"
              style={{ maxHeight: "90vh" }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#fafaf8] border-b border-black/[0.06] px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-[0.9rem] tracking-[0.08em] uppercase">Filtros</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto px-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
                <FilterContent />
              </div>

              {/* Apply Button */}
              <div className="sticky bottom-0 bg-[#fafaf8] border-t border-black/[0.06] p-6">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-4 text-white text-[0.75rem] tracking-[0.15em] uppercase transition-opacity hover:opacity-85"
                  style={{ backgroundColor: GOLD }}
                >
                  Aplicar Filtros ({itemCount})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}