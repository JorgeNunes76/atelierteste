import { Link } from "react-router-dom";
import { useCart, type ObraCarrinho } from "../lib/cart";
import { motion } from "motion/react";
import { Trash2, ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";

import { GOLD, CREAM } from "../lib/tokens";

export function CarrinhoPage() {
  const { items, removeItem, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", background: CREAM, padding: "clamp(72px,10vw,80px) 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <ShoppingBag size={64} strokeWidth={1} style={{ color: GOLD, marginBottom: "24px" }} />
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "#1a1a1a", marginBottom: "12px" }}>
            O teu carrinho está vazio
          </h1>
          <p style={{ color: "rgba(26,26,26,0.6)", marginBottom: "32px" }}>
            Descobre as obras disponíveis na nossa galeria
          </p>
          <Link
            to="/galeria"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: `linear-gradient(135deg, ${GOLD} 0%, #d4b87a 50%, #b89a5e 100%)`,
              color: "#fff",
              padding: "14px 28px",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "4px",
            }}
          >
            Ver Galeria
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: CREAM, padding: "clamp(72px,10vw,100px) 20px clamp(40px,6vw,60px)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem,3vw,2rem)", color: "#1a1a1a" }}>
            O Meu Carrinho
          </h1>
          <button
            onClick={clearCart}
            style={{ background: "none", border: "none", color: "rgba(26,26,26,0.5)", cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.05em" }}
          >
            Limpar tudo
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                gap: "20px",
                background: "#fff",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ width: 120, height: 120, flexShrink: 0, borderRadius: "4px", overflow: "hidden" }}>
                <img
                  src={item.imagem_url}
                  alt={item.titulo}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#1a1a1a", marginBottom: "4px" }}>
                    {item.titulo}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "rgba(26,26,26,0.6)" }}>{item.tecnica}</p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(26,26,26,0.5)" }}>{item.dimensoes}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.25rem", color: GOLD, fontWeight: 600 }}>
                    €{item.preco.toLocaleString("pt-PT")}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: "8px" }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ marginTop: "40px", padding: "24px", background: "#fff", borderRadius: "8px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "1rem", color: "rgba(26,26,26,0.7)" }}>Total</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.75rem", color: "#1a1a1a", fontWeight: 600 }}>
              €{totalPrice.toLocaleString("pt-PT")}
            </span>
          </div>
          <Link
            to="/checkout"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              background: `linear-gradient(135deg, ${GOLD} 0%, #d4b87a 50%, #b89a5e 100%)`,
              color: "#fff",
              padding: "16px",
              fontSize: "0.75rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            Finalizar Compra
            <ArrowRight size={16} />
          </Link>
        </div>

        <Link
          to="/galeria"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "24px",
            color: "rgba(26,26,26,0.6)",
            textDecoration: "none",
            fontSize: "0.85rem",
          }}
        >
          <ArrowLeft size={16} />
          Continuar a explorar
        </Link>
      </div>
    </div>
  );
}
