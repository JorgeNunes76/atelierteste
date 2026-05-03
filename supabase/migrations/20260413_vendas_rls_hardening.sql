-- Migration: Vendas RLS Hardening
-- Objectivo: eliminar INSERT direto do cliente na tabela vendas.
-- Toda a criação de vendas passa agora por Edge Functions com service role.
--
-- Aplicar no SQL Editor do Supabase Dashboard.

-- ── 1. Remover política de INSERT público ─────────────────────────────────────
-- Esta policy permitia que qualquer pessoa com a anon key inserisse uma venda
-- com estado='pago', total=0, ou qualquer outro valor arbitrário.
DROP POLICY IF EXISTS "vendas_insert_public" ON vendas;

-- ── 2. Trigger de defesa em profundidade ──────────────────────────────────────
-- Mesmo que RLS seja mal configurado no futuro, este trigger garante que:
--   • estado é sempre 'pendente' no momento do INSERT
--   • stripe_session_id é sempre NULL no INSERT (nunca vem do cliente)
-- Aplica-se a todos os roles, incluindo service_role.
-- Não afecta UPDATE (o webhook atualiza estado e stripe_session_id via UPDATE).
CREATE OR REPLACE FUNCTION vendas_insert_guard()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $$
BEGIN
  NEW.estado            := 'pendente';
  NEW.stripe_session_id := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_vendas_insert_guard ON vendas;
CREATE TRIGGER tg_vendas_insert_guard
  BEFORE INSERT ON vendas
  FOR EACH ROW
  EXECUTE FUNCTION vendas_insert_guard();

-- ── Verificação (opcional, pode correr a seguir para confirmar) ───────────────
-- SELECT polname, polcmd FROM pg_policies WHERE tablename = 'vendas';
-- Deve mostrar apenas: vendas_admin_all (ALL) e vendas_client_read (SELECT).
-- Não deve existir nenhuma policy de INSERT para anon/authenticated.
