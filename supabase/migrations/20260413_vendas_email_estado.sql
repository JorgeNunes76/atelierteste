-- Migration: Estado de envio de email para webhooks Stripe
-- Objectivo: tornar o envio do recibo idempotente e recuperável em retries.
--
-- `email_estado` só é usado pelo fluxo de cartão no webhook Stripe.
-- Valores esperados:
--   NULL            -> legado / ainda não inicializado
--   'pendente'      -> pronto para tentativa de envio
--   'enviando'      -> um webhook já reclamou o envio
--   'enviado'       -> recibo enviado com sucesso
--   'retry_needed'  -> envio falhou; próximo retry pode tentar novamente

ALTER TABLE vendas
  ADD COLUMN IF NOT EXISTS email_estado text;

-- CHECK constraint aplicado separadamente para ser idempotente mesmo que a coluna
-- já existisse sem restrição numa instalação anterior.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'vendas_email_estado_check'
      AND conrelid = 'vendas'::regclass
  ) THEN
    ALTER TABLE vendas
      ADD CONSTRAINT vendas_email_estado_check
      CHECK (email_estado IN ('pendente', 'enviando', 'enviado', 'retry_needed'));
  END IF;
END $$;

COMMENT ON COLUMN vendas.email_estado IS
  'Estado do recibo Stripe: pendente, enviando, enviado, retry_needed';
