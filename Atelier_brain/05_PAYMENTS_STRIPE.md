# 05 — Pagamentos / Stripe

## Visão geral

Dois caminhos de pagamento, arquitecturas muito diferentes:

| | Cartão | Transferência |
|---|--------|---------------|
| Preço validado server-side | ✅ Edge Fn recalcula | ✅ Edge Fn recalcula |
| Obra reservada | ❌ (bug F2/F4) | ❌ (bug F4) |
| Venda criada | ✅ (pendente) | ✅ (pendente) |
| Stock actualizado automaticamente | ✅ via webhook | ❌ manual pelo admin |
| Email automático | ✅ webhook → Resend | ✅ Edge Fn send-email |
| Funcional hoje | ❌ bug F1 payload | ⚠️ IBAN placeholder |

---

## Fluxo Cartão — passo a passo

```
1. CheckoutPage.tsx:83
   supabase.from("obras").select(estado)   ← verifica disponibilidade (sem lock)

2. src/lib/stripe.ts:41
   POST /functions/v1/create-checkout-session
   body: { items: itemIds, ... }           ← BUG: deve ser { itemIds: itemIds }

3. create-checkout-session/index.ts:57
   body.itemIds = undefined
   fallback: body.items.map(i => i.id) = [undefined, ...]  ← QUEBRADO

   [se corrigido:]
   SELECT obras WHERE id IN (itemIds)      ← valida preços reais
   SELECT obras WHERE estado = 'disponivel' ← verifica (sem lock atómico)
   INSERT vendas (estado='pendente')        ← sem stripe_session_id ainda
   stripe.checkout.sessions.create({ metadata: { venda_id } })
   ← stripe_session_id NÃO guardado na venda aqui

4. window.location.href = session.url     ← Stripe hosted checkout

5. [Após pagamento] Stripe → stripe-webhook/index.ts
   checkout.session.completed:
     lookup principal: vendas.stripe_session_id = session.id
     fallback: metadata.venda_id (compatibilidade/recuperação)
     UPDATE vendas SET estado='pago', stripe_session_id=session.id
       WHERE estado IN ('pendente','cancelado') e sessão está realmente paid/complete
     UPDATE obras SET estado='vendido', reserved_until=NULL WHERE id IN items
     claim atómico do recibo via vendas.email_estado:
       NULL/pendente/retry_needed → enviando → enviado | retry_needed
```

## Fluxo Sessão Expirada

```
checkout.session.expired:
  stripe.checkout.sessions.retrieve(session.id)  ← confirma estado real
  se sessão já está paid/complete: ignorar
  senão:
    SELECT vendas WHERE stripe_session_id = session.id
    fallback: metadata.venda_id
    UPDATE vendas SET estado='cancelado' WHERE estado='pendente'
    UPDATE obras SET estado='disponivel', reserved_until=NULL WHERE estado='reservado'
```
Fix final: `stripe_session_id` é a chave principal de correlação; `metadata.venda_id` fica só como fallback.

## Fluxo Transferência — passo a passo

```
1. CheckoutPage.tsx:105
   POST /functions/v1/create-transfer-order
   body: { itemIds, customerEmail, customerName, ...campos públicos }

2. create-transfer-order/index.ts
   valida payload server-side
   rejeita campos internos: total, estado, items, stripe_session_id, referencia...
   aceita `metodo_pagamento` apenas se for 'transferencia'
   SELECT obras WHERE id IN (itemIds)
   valida que todas existem e estado='disponivel'
   recalcula total e items reais da BD
   INSERT vendas (estado='pendente', metodo_pagamento='transferencia', referencia=ARTE-...)

3. Edge Fn envia email best-effort ao cliente + BCC atelier
4. clearCart → navigate('/sucesso?transferencia=true')
```

## Estados de uma venda

```
pendente → pago     (via webhook completed)
pendente → cancelado (via webhook expired — actualmente quebrado)
pago → enviado      (admin muda manualmente)
* → cancelado       (admin muda manualmente ou webhook expired)
```

## Configuração Stripe necessária

| Secret Supabase | Valor |
|-----------------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_*` (produção) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` do endpoint configurado |
| `SITE_URL` | `https://atelieranaalexandre.pt` |

**Env no frontend:**
- `VITE_STRIPE_PUBLISHABLE_KEY` → `pk_live_*` para produção

**Webhook endpoint Stripe:**
`https://vqunmqtozykwqtmyfjyi.supabase.co/functions/v1/stripe-webhook`

Eventos a subscrever no Stripe Dashboard:
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.payment_failed`

## API Version

Ambas as Edge Functions usam `apiVersion: "2024-06-20"`. Fixada — não actualiza automaticamente.

## success_url / cancel_url

```typescript
success_url: `${SITE_URL}/sucesso?session_id={CHECKOUT_SESSION_ID}`
cancel_url:  `${SITE_URL}/checkout`
```
`SITE_URL` via secret. Fallback hardcoded: `https://atelieranaalexandre.pt`.

## Outros envios de email (Resend)

| Quando | Destinatário | Template |
|--------|-------------|----------|
| Pagamento confirmado (cartão) | cliente + BCC atelier | `buildReceiptHtml` em stripe-webhook |
| Pedido por transferência | cliente + BCC atelier | `buildTransferOrderHtml` em send-email |
| Novo contacto | atelier | `notify-contacto` Edge Fn |

**Remetente:** `noreply@ana-alexandre.pt` (domínio Resend — deve estar verificado)

## Bugs activos neste fluxo

Ver [[08_BUGS_AND_RISKS]] para lista completa. Resumo:
- **F1** — payload key mismatch → cartão quebrado
- **F2** — race condition → dupla venda
- **F3** — expired handler quebrado → vendas fantasma
- **F4** — transferência não reserva obra
- **F5** — webhook não idempotente → email duplicado
- **F6** — retry cria vendas duplicadas
- **F7** — referência não guardada na venda
