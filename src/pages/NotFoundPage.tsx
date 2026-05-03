import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Search } from "lucide-react";

import { GOLD, CREAM, CHARCOAL } from "../lib/tokens";

export function NotFoundPage() {
  return (
    <div style={{ 
      background: CREAM, 
      minHeight: "80vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "40px 24px",
      textAlign: "center"
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: 500 }}
      >
        {/* Abstract 404 Visual */}
        <div style={{
          position: "relative",
          width: 120,
          height: 120,
          margin: "0 auto 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Decorative circles */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              inset: 0,
              border: `1px dashed ${GOLD}40`,
              borderRadius: "50%"
            }}
          />
          <h2 style={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: "4rem",
            color: GOLD,
            margin: 0,
            opacity: 0.8,
            fontWeight: 400
          }}>
            404
          </h2>
        </div>

        <h1 style={{
          fontFamily: "'Bodoni Moda', serif",
          fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
          color: CHARCOAL,
          marginBottom: "16px",
          fontWeight: 400
        }}>
          Este caminho ainda não foi pintado.
        </h1>

        <p style={{ 
          color: "#64748B", 
          fontSize: "1rem", 
          lineHeight: 1.7, 
          marginBottom: "40px",
          maxWidth: "400px",
          marginInline: "auto"
        }}>
          A página que procuras pode ter sido movida para outro acervo ou não existir no nosso atelier.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link 
            to="/galeria" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              background: CHARCOAL,
              color: "#FFF",
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 500,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}
          >
            Explorar Galeria
          </Link>
          
          <Link 
            to="/" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              border: "1px solid rgba(0,0,0,0.1)",
              color: CHARCOAL,
              borderRadius: "8px",
              fontSize: "0.8rem",
              fontWeight: 500,
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              transition: "all 0.3s ease"
            }}
          >
            Voltar ao Início
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
