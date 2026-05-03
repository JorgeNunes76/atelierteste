import { useEffect } from "react";
import { ExternalLink } from "lucide-react";

import { GOLD, CREAM, CHARCOAL, SLATE } from "../lib/tokens";

const RECLAMACOES_URL = "https://www.livroreclamacoes.pt/inicio";

export function ReclamacoesPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open(RECLAMACOES_URL, "_blank", "noopener,noreferrer");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: CREAM, minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: `${GOLD}15`, border: `1px solid ${GOLD}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <ExternalLink size={26} color={GOLD} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.6rem, 4vw, 2rem)",
          fontWeight: 400, color: CHARCOAL,
          margin: "0 0 16px", lineHeight: 1.2,
        }}>
          Livro de Reclamações
        </h1>

        <p style={{ fontSize: "0.9rem", color: SLATE, lineHeight: 1.7, margin: "0 0 32px" }}>
          O livro de reclamações eletrónico está disponível no portal oficial do Governo Português.
          Serás redirecionado(a) automaticamente.
        </p>

        <a
          href={RECLAMACOES_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 10,
            background: CHARCOAL, color: "#FFF",
            fontSize: "0.9rem", fontWeight: 500, textDecoration: "none",
          }}
        >
          Abrir Livro de Reclamações <ExternalLink size={14} strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}
