# 10 — Plano de Testes

> Testes manuais do fluxo crítico. Executar após cada fase do roadmap.

---

## Pré-requisitos

- `npm run dev` a correr em `http://localhost:5173`
- Supabase com pelo menos 2 obras no estado `disponivel`
- Stripe em modo teste: chave `pk_test_*`
- Logs do Supabase Edge Functions abertos: Dashboard → Functions → Logs

---

## T1 — Checkout por cartão (Happy Path)

1. Abrir galeria → adicionar obra ao carrinho
2. Ir ao carrinho → verificar item presente
3. Clicar "Checkout" → deve redirigir para `/login` se não autenticado
4. Fazer login → deve redirigir de volta para `/checkout`
5. Preencher Step 1 (entrega) com dados válidos
6. Clicar "Continuar para Pagamento"
7. Seleccionar "Cartão de Crédito / Débito"
8. Clicar "Pagar com Cartão"
9. **Verificar nos logs:** Edge Fn `create-checkout-session` recebe `itemIds` (não `items`)
10. Deve redirigir para `checkout.stripe.com`
11. Usar cartão teste `4242 4242 4242 4242`, data futura, CVC qualquer
12. Confirmar pagamento
13. Deve redirigir para `/sucesso?session_id=...`
14. **Verificar na BD:** `vendas.estado = 'pago'`, `obras.estado = 'vendido'`
15. **Verificar email:** recibo recebido pelo cliente + BCC no atelier

**Expected after fix F1:** sem erro 400 na Edge Fn.

---

## T2 — Sessão Stripe expirada

1. Iniciar checkout por cartão (seguir T1 até step 10)
2. Em vez de pagar, aguardar que sessão expire (ou forçar via Stripe Dashboard → Webhooks → Send test event: `checkout.session.expired`)
3. **Verificar na BD:** `vendas.estado = 'cancelado'`, `obras.estado = 'disponivel'`

**Expected after fix F3:** venda cancelada e obra libertada.

---

## T3 — Race condition (dupla venda)

1. Abrir dois browsers (ou aba normal + aba privada)
2. Em ambos, adicionar a mesma obra ao carrinho
3. Em ambos, fazer login e preencher checkout
4. Clicar "Pagar com Cartão" nos dois quase em simultâneo
5. **Verificar:** apenas uma sessão Stripe criada com sucesso; segundo pedido deve retornar erro 409

**Expected after fix F2:** segundo pedido recebe "Obra já não está disponível".

---

## T4 — Checkout por transferência (Happy Path)

1. Seguir T1 até step 7
2. Seleccionar "Transferência Bancária / MBWay"
3. Verificar que IBAN apresentado é o real (não `PT50 0000...`)
4. Clicar "Confirmar Pedido"
5. **Verificar na BD:** venda criada com `estado='pendente'`, `metodo_pagamento='transferencia'`, `referencia` preenchida
6. **Verificar na BD:** obra com `estado='reservado'`
7. **Verificar email:** confirmação recebida com IBAN correcto e referência que existe na BD

**Expected after fixes F4, F7, F8, D1-D4.**

---

## T5 — Checkout por transferência + cartão (conflito)

1. Browser A: iniciar checkout por transferência para obra X → confirmar → obra deve ficar 'reservado'
2. Browser B: tentar adicionar obra X ao carrinho e iniciar checkout por cartão
3. **Verificar:** Edge Fn retorna erro "Obra já não está disponível" pois está 'reservado'

**Expected after fix F4.**

---

## T6 — Retry de transferência (sem duplicar venda)

1. Iniciar checkout por transferência
2. Simular falha de email (desligar temporariamente `RESEND_API_KEY` nos secrets ou mockar)
3. Submeter checkout → deve navegar para `/sucesso` mesmo que email falhe
4. **Verificar na BD:** apenas UMA venda criada
5. Carrinho deve estar limpo

**Expected after fix F6.**

---

## T7 — Admin — gestão de vendas

1. Login como admin → `/admin`
2. Verificar stats no Dashboard
3. Abrir Vendas → ver venda criada em T1
4. Mudar estado para "Enviado"
5. **Verificar na BD:** `vendas.estado = 'enviado'`

---

## T8 — Admin — gestão de obras

1. Login como admin → `/admin/obras`
2. Criar nova obra com imagem → verificar imagem no bucket
3. Editar obra existente
4. Verificar que obra aparece na galeria pública

---

## T9 — Segurança básica

1. Tentar aceder a `/admin` sem login → deve redirigir para `/login`
2. Fazer login como cliente (não admin) → tentar `/admin` → deve ser bloqueado
3. Tentar manipular localStorage (preço no carrinho) → iniciar checkout por cartão → verificar que preço na Edge Fn é o da BD (não o do cliente)

---

## Checklist pré-produção

- [ ] T1 passa (cartão happy path)
- [ ] T2 passa (sessão expirada)
- [ ] T3 passa (race condition)
- [ ] T4 passa (transferência happy path)
- [ ] T5 passa (conflito cartão/transferência)
- [ ] T6 passa (retry sem duplicação)
- [ ] Stripe chaves live configuradas
- [ ] Domínio Resend verificado
- [ ] HSTS + CSP em vercel.json
- [ ] Email verificado activo no Supabase Auth

---

## Suite automatizada minima (2026-04-13)

Comando:

```bash
npm test
```

Cobertura atual (regressao critica de pagamentos):

1. `tests/critical/atomic-reservation.contract.test.ts`
- Contrato da reserva atomica: migration mantem `FOR UPDATE`, `reserved_until` e `estado='reservado'`.
- Contrato de implementacao: `create-checkout-session` continua a usar a RPC `reserve_obras_and_create_venda`.

2. `tests/critical/stripe-webhook-state-machine.test.ts`
- Ordering `completed` vs `expired` com eventos fora de ordem.
- Transicoes validas de estado sem libertar stock quando sessao esta paga.
- Idempotencia logica para venda ja paga.

3. `tests/critical/stripe-webhook.idempotency.contract.test.ts`
- Guard de transicao no `completed` (`.in("estado", ["pendente", "cancelado"])`).
- Guard de retry de email por `email_estado`.

4. `tests/critical/create-transfer-order.validation.test.ts`
- Rejeita payload adulterado com campos internos.
- Rejeita `metodo_pagamento` fora da whitelist.
- Rejeita campos inesperados e `itemIds` duplicados.

Limitacoes da suite:
- Concorrencia real de BD (2 checkouts paralelos) continua como teste manual T3 ou teste de integracao em ambiente real.
- Fluxo fim-a-fim com Stripe CLI + DB real continua no plano manual.
