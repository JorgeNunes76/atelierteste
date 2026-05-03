-- Migration: admins_read hardening
-- Objetivo: impedir leitura pública da tabela admins.
-- Regra final: apenas utilizadores que passam em is_admin() podem ler admins.

DROP POLICY IF EXISTS "admins_read" ON public.admins;

CREATE POLICY "admins_read"
  ON public.admins
  FOR SELECT
  USING (is_admin());
