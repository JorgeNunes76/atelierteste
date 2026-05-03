// Pulsing skeleton placeholder — used while artwork data is loading.
// Works for both the HomePage featured grid and GaleriaPage grid/list views.

const SHIMMER: React.CSSProperties = {
  background: "linear-gradient(90deg, #edeae4 0%, #f5f2ee 50%, #edeae4 100%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.6s ease-in-out infinite",
};

// Inject the keyframe once (idempotent)
if (typeof document !== "undefined" && !document.getElementById("skeleton-style")) {
  const s = document.createElement("style");
  s.id = "skeleton-style";
  s.textContent = `@keyframes skeleton-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
  document.head.appendChild(s);
}

/** Card skeleton — matches the ArtworkCard shape in the gallery grid */
export function SkeletonCard({
  size = "default",
  viewMode = "grid",
}: {
  size?: "hero" | "default";
  viewMode?: "grid" | "list";
}) {
  if (viewMode === "list") {
    return (
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "24px 0",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 120,
            height: 120,
            borderRadius: 4,
            ...SHIMMER,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ height: 10, width: "35%", borderRadius: 4, marginBottom: 10, ...SHIMMER }} />
          <div style={{ height: 14, width: "60%", borderRadius: 4, marginBottom: 8, ...SHIMMER }} />
          <div style={{ height: 11, width: "40%", borderRadius: 4, ...SHIMMER }} />
        </div>
      </div>
    );
  }

  const aspectRatio = size === "hero" ? "0.85 / 1" : "1 / 1";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Image area */}
      <div style={{ aspectRatio, width: "100%", ...SHIMMER }} />

      {/* Text area */}
      <div style={{ padding: size === "hero" ? "20px 24px 24px" : "14px 18px 18px" }}>
        <div
          style={{
            height: 10,
            width: "45%",
            borderRadius: 3,
            marginBottom: 8,
            ...SHIMMER,
          }}
        />
        <div
          style={{
            height: size === "hero" ? 18 : 14,
            width: "70%",
            borderRadius: 3,
            marginBottom: 6,
            ...SHIMMER,
          }}
        />
        <div style={{ height: 11, width: "30%", borderRadius: 3, ...SHIMMER }} />
      </div>
    </div>
  );
}

/** Error state shown when artwork fetch fails */
export function ArtworkLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "64px 24px",
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(196,149,106,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: "1.5rem",
        }}
      >
        ⚠
      </div>
      <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: 6 }}>
        Não foi possível carregar as obras
      </p>
      <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: 24 }}>
        Verifique a sua ligação e tente novamente
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "10px 28px",
          border: "1px solid #C9A96E",
          borderRadius: 6,
          background: "transparent",
          color: "#C9A96E",
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
