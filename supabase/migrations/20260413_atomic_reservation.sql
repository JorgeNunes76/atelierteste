-- Migration: Reserva Atómica de Obras para Checkout por Cartão
-- Objectivo: eliminar race condition de dupla venda de obras únicas.
--
-- Abordagem: função PostgreSQL executada em transação ACID única que:
--   1. Bloqueia as linhas de obras com SELECT ... FOR UPDATE
--   2. Valida disponibilidade de cada obra
--   3. Reserva (estado='reservado', reserved_until=+35min)
--   4. Cria a venda
--
-- Garantia: dois clientes a tentar reservar a mesma obra em simultâneo:
--   • O 1º adquire o lock e completa a transação
--   • O 2º fica bloqueado no FOR UPDATE; após o 1º commit,
--     lê estado='reservado' e recebe o erro correcto
--
-- Aplicar no SQL Editor do Supabase Dashboard.

-- ── 1. Campo de expiração de reserva ──────────────────────────────────────────
ALTER TABLE obras ADD COLUMN IF NOT EXISTS reserved_until timestamptz;

-- ── 2. Função de reserva atómica ───────────────────────────────────────────────
-- SECURITY DEFINER: corre como owner (postgres/superuser), bypass RLS legitimamente.
-- O trigger tg_vendas_insert_guard continua a correr e garante estado='pendente'.
CREATE OR REPLACE FUNCTION reserve_obras_and_create_venda(
  p_item_ids         uuid[],
  p_customer_nome    text,
  p_customer_email   text,
  p_customer_tel     text,
  p_morada           text,
  p_metodo_pagamento text DEFAULT 'card'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- previne search_path hijacking
AS $$
DECLARE
  v_obra     RECORD;
  v_total    numeric(10,2) := 0;
  v_items    jsonb         := '[]'::jsonb;
  v_venda_id uuid;
  v_found    int           := 0;
BEGIN
  -- Percorrer e bloquear todas as obras pedidas.
  -- FOR UPDATE: bloqueia as linhas para escrita até ao fim da transação.
  -- Uma transação concorrente que tente bloquear a mesma linha aguarda aqui.
  FOR v_obra IN
    SELECT id, titulo, preco, estado
    FROM   obras
    WHERE  id = ANY(p_item_ids)
    FOR UPDATE
  LOOP
    v_found := v_found + 1;

    IF v_obra.estado != 'disponivel' THEN
      RAISE EXCEPTION 'A obra "%" já não está disponível.', v_obra.titulo
        USING ERRCODE = 'P0002';
    END IF;

    v_total := v_total + COALESCE(v_obra.preco, 0);
    v_items := v_items || jsonb_build_array(
      jsonb_build_object(
        'id',     v_obra.id,
        'titulo', v_obra.titulo,
        'preco',  v_obra.preco
      )
    );
  END LOOP;

  -- Validar que todos os IDs pedidos existem na BD
  IF v_found != array_length(p_item_ids, 1) THEN
    RAISE EXCEPTION 'Uma ou mais obras não foram encontradas no catálogo.'
      USING ERRCODE = 'P0001';
  END IF;

  -- Reservar obras: 35 min (Stripe session = 30 min + 5 min de buffer)
  -- Se o pagamento não ocorrer, o webhook expired ou a cleanup fn libertam a reserva.
  UPDATE obras
  SET
    estado         = 'reservado',
    reserved_until = NOW() + interval '35 minutes'
  WHERE id = ANY(p_item_ids);

  -- Criar venda na mesma transação
  -- O trigger tg_vendas_insert_guard força estado='pendente' (defesa em profundidade)
  INSERT INTO vendas (
    cliente_nome,
    cliente_email,
    cliente_tel,
    morada,
    total,
    items,
    estado,
    metodo_pagamento
  )
  VALUES (
    p_customer_nome,
    p_customer_email,
    NULLIF(p_customer_tel, ''),
    NULLIF(p_morada, ''),
    v_total,
    v_items,
    'pendente',
    p_metodo_pagamento
  )
  RETURNING id INTO v_venda_id;

  RETURN json_build_object(
    'venda_id', v_venda_id,
    'total',    v_total,
    'items',    v_items
  );
END;
$$;

-- Apenas service_role (Edge Functions com SUPABASE_SERVICE_ROLE_KEY) pode invocar
REVOKE EXECUTE ON FUNCTION reserve_obras_and_create_venda FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION reserve_obras_and_create_venda TO service_role;

-- ── 3. Função de limpeza de reservas expiradas ─────────────────────────────────
-- Mecanismo de backup ao webhook checkout.session.expired do Stripe.
-- Invocar manualmente ou agendar via pg_cron (ver abaixo).
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_released int := 0;
BEGIN
  -- Libertar obras cuja janela de reserva expirou
  WITH expired AS (
    UPDATE obras
    SET
      estado         = 'disponivel',
      reserved_until = NULL
    WHERE estado = 'reservado' AND reserved_until < NOW()
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_released FROM expired;

  -- Cancelar vendas de cartão ainda pendentes após 36 minutos
  -- (proxy conservador: created_at + 36 min > reserved_until de 35 min)
  UPDATE vendas
  SET estado = 'cancelado'
  WHERE estado           = 'pendente'
    AND metodo_pagamento = 'card'
    AND created_at       < NOW() - interval '36 minutes';

  RAISE NOTICE 'release_expired_reservations: % obras libertadas', v_released;
  RETURN v_released;
END;
$$;

REVOKE EXECUTE ON FUNCTION release_expired_reservations FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION release_expired_reservations TO service_role;

-- ── 4. Agendamento automático via pg_cron (opcional) ──────────────────────────
-- Requer a extensão pg_cron activada em Supabase (Database > Extensions).
-- Descomentar e correr uma vez para agendar limpeza a cada 10 minutos:
--
-- SELECT cron.schedule(
--   'release-expired-reservations',
--   '*/10 * * * *',
--   'SELECT release_expired_reservations()'
-- );
