-- Migration: auth_is_admin_app_metadata
-- Objectivo: refactor a função is_admin() para usar exclusivamente app_metadata.role.
-- Justificação: Elimina dependência da tabela public.admins (embora segura) para usar o
-- padrão recomendado de claims JWT, que é mais performativo em RLS.
-- O frontend já usa app_metadata.role via ProtectedRoute.

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  -- O role 'admin' deve estar presente em auth.jwt() -> 'app_metadata' ->> 'role'.
  -- Isto é injectado pelo Supabase e não pode ser alterado pelo utilizador via CLI ou API auth.updateUser.
  RETURN (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
END;
$$;
