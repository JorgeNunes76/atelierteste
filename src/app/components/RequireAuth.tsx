import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../../lib/auth";
import { LoadingSpinner } from "./LoadingSpinner";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const location = useLocation();

  if (session === undefined) return <LoadingSpinner />;
  if (!session) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;

  return <>{children}</>;
}
