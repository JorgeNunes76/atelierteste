-- Migration: Remover policies de insert público em contactos e newsletter
--
-- Contexto:
--   As edge functions submit-contact e subscribe-newsletter foram criadas para
--   validar, fazer rate limiting e proteger contra spam antes de inserir.
--   Mas as policies originais "contactos_public_insert" e "newsletter_public_insert"
--   ainda permitem que qualquer cliente com a anon key insira directamente,
--   contornando completamente o honeypot, timing check e rate limit.
--
--   Este migration fecha esse vector: a partir de agora, só o service_role
--   (usado pelos edge functions) pode inserir nestas tabelas.
--
-- Impacto zero no frontend: contactos e newsletter já não inserem directamente
-- (usam invokePublicFunction → edge function → service_role).

-- ── contactos ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "contactos_public_insert" ON public.contactos;

-- ── newsletter ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "newsletter_public_insert" ON public.newsletter;
