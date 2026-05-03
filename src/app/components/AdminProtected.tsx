import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const AdminLayout = lazy(() =>
  import("../../features/admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);

export function AdminProtected() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              background: "#0D0D0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9A96E",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
            }}
          >
            A carregar Painel Administrativo...
          </div>
        }
      >
        <AdminLayout />
      </Suspense>
    </ProtectedRoute>
  );
}
