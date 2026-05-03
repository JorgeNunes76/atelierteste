export const estadoMap: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export function classifyTecnica(tecnica: string): {
  techniqueType: "drawing" | "oil" | "mixed" | "acrylic";
  category: "drawing" | "series" | "acervo";
  categoryLabel: string;
} {
  const t = (tecnica || "").toLowerCase();
  const techniqueType =
    t.includes("grafite") || t.includes("papel") ? "drawing"
    : t.includes("óleo") || t.includes("oleo") ? "oil"
    : t.includes("mista") ? "mixed"
    : "acrylic";
  const category =
    techniqueType === "drawing" ? "drawing"
    : techniqueType === "mixed" ? "series"
    : "acervo";
  const categoryLabel =
    techniqueType === "drawing" ? "Desenhos & Estudos"
    : techniqueType === "mixed" ? "Séries Temáticas"
    : "Obras Principais";
  return { techniqueType, category, categoryLabel };
}
