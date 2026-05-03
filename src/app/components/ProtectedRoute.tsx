import { Navigate } from "react-router-dom";
import { useSession } from "../../lib/auth";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const session = useSession();

  // 1. Loading state
  if (session === undefined) return <LoadingSpinner />;
  
  // 2. No session -> Redirect to Login
  if (!session) {
    if (import.meta.env.DEV) console.log("[Auth] Nenhuma sessão encontrada. Redirecionando para /login.");
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  // 3. Admin Check (if requested)
  if (requireAdmin) {
    // Check in app_metadata (from Supabase claims/roles)
    const isAdmin = session.user?.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      if (import.meta.env.DEV) {
        console.warn("[Auth] Acesso Admin Bloqueado:", session.user.email, "não possui roles administrativas.");
        console.info("[Auth] Dica: Certifique-se que o utilizador tem 'role: admin' no Supabase App Metadata.");
      }
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
