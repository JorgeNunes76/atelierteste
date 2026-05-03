import { GOLD, CREAM } from "../../lib/tokens";

export function LoadingSpinner() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CREAM }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${GOLD}30`, borderTopColor: GOLD, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
