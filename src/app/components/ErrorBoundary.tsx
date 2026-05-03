import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { captureClientError } from "../../lib/observability";
import { GOLD, CREAM } from "../../lib/tokens";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureClientError(error, {
      source: "react.error_boundary",
      componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: CREAM,
            padding: 24,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2rem",
                color: "#1a1a1a",
                marginBottom: 12,
              }}
            >
              Ups... Alguma coisa falhou.
            </h1>
            <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 32 }}>
              Lamentamos o inconveniente. Ocorreu um erro inesperado ao apresentar esta secção da galeria. A nossa
              equipa já foi notificada silenciosamente.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 24px",
                  background: GOLD,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                Tentar Novamente
              </button>
              <Link
                to="/"
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#1a1a1a",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                }}
              >
                Voltar à Página Principal
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
