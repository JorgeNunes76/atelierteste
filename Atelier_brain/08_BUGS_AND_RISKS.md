# 08 — Bugs e Riscos Conhecidos

> Auditado em 2026-04-13. Actualizar quando bugs forem corrigidos.
> Para cada bug: marcar ✅ quando resolvido e adicionar data + commit.

---

## CRÍTICO — Bloqueiam produção segura

### F1 — Payload key mismatch → checkout por cartão quebrado ❌
- **Ficheiro:** `src/lib/stripe.ts:42` + `supabase/functions/create-checkout-session/index.ts:57`
- **Causa:** `stripe.ts` envia `{ items: itemIds }` mas Edge Fn espera `{ itemIds: [...] }`. Fallback tenta `items.map(i => i.id)` mas items são strings → `[undefined, ...]` → Supabase query falha → 400.
- **Impacto:** Nenhum pagamento por cartão é possível.
- **Fix:** Mudar `stripe.ts:42` de `items: itemIds` para `itemIds: itemIds`. Limpar fallback na Edge Fn.
- **Estado:** ❌ Por corrigir

### F2 — Race condition → dupla venda da mesma obra ❌
- **Ficheiro:** `supabase/functions/create-checkout-session/index.ts:68-112`
- **Causa:** Verificação `estado='disponivel'` e INSERT venda não são atómicos. Dois pedidos simultâneos passam ambos na verificação.
- **Impacto:** Dois clientes pagam pela mesma obra. Segundo pagamento é inreembolsável sem intervenção.
- **Fix:** `UPDATE obras SET estado='reservado' WHERE id=ANY(itemIds) AND estado='disponivel'` antes de criar venda; verificar `count === itemIds.length`.
- **Estado:** ❌ Por corrigir

### F3 — `stripe_session_id` NULL quando sessão expira → vendas fantasma ❌
- **Ficheiro:** `supabase/functions/stripe-webhook/index.ts:104-119`
- **Causa:** `stripe_session_id` só é escrito no webhook `completed`. Handler `expired` procura `.eq("stripe_session_id", session.id)` → encontra nada → venda fica `pendente` para sempre.
- **Impacto:** Acumulação de vendas fantasma no admin. Stock nunca libertado (mas obras nunca foram reservadas, por isso sem impacto operacional imediato).
- **Fix:** Usar `session.metadata.venda_id` em vez de `stripe_session_id` no handler expired.
- **Estado:** ❌ Por corrigir

### F4 — Transferência não reserva obra → conflito com cartão ❌
- **Ficheiro:** `src/pages/CheckoutPage.tsx:105-141`
- **Causa:** Fluxo de transferência cria venda `pendente` mas não altera `obras.estado`. Obra permanece `disponivel`.
- **Impacto:** Cliente A faz transferência; Cliente B compra por cartão; webhook marca obra `vendido`. Cliente A pagou por obra já vendida.
- **Fix:** Após `createVenda`, chamar `updateObraStatus(id, 'reservado')` para cada obra.
- **Estado:** ❌ Por corrigir

### F8 — BANK const com dados placeholder ❌
- **Ficheiro:** `src/pages/CheckoutPage.tsx:14`
- **Causa:** `const BANK = { iban: "PT50 0000 0000 0000 0000 0000 0", mbway: "+351 9xx xxx xxx" }` — dados fictícios hardcoded.
- **Impacto:** Clientes que escolhem transferência vêem IBAN falso na UI. Pagamentos por transferência impossíveis.
- **Fix:** Ler `bank_iban` e `bank_mbway` de `config_site` (precisam de ser inseridos no Supabase).
- **Estado:** ❌ Por corrigir

---

## ALTO — Comprometem fiabilidade

### F5 — Webhook não idempotente → email duplicado em retry ❌
- **Ficheiro:** `supabase/functions/stripe-webhook/index.ts:52-100`
- **Causa:** Sem guard `WHERE estado='pendente'` antes de enviar email. UPDATE é idempotente mas email é enviado sempre que webhook dispara.
- **Impacto:** Cliente recebe múltiplos recibos em retries Stripe.
- **Fix:** Adicionar `.eq("estado", "pendente")` ao UPDATE; se `vendaData` for null, skip email.
- **Estado:** ❌ Por corrigir

### F6 — Retry do transfer cria vendas duplicadas ❌
- **Ficheiro:** `src/pages/CheckoutPage.tsx:105-146`
- **Causa:** Se `sendTransferOrderEmail` falha, erro é mostrado mas venda já foi criada. Utilizador pode submeter novamente → segunda venda criada.
- **Fix:** `clearCart()` imediatamente após `createVenda` (antes dos emails). Emails como best-effort (não relançar erro).
- **Estado:** ❌ Por corrigir

### F7 — Referência de transferência gerada no email, não guardada na venda ❌
- **Ficheiro:** `supabase/functions/send-email/index.ts:167`
- **Causa:** `ARTE-${Date.now().toString(36)}` gerado no momento do email — valor nunca escrito na coluna `referencia` da venda.
- **Impacto:** Atelier recebe transferência com referência que não consegue associar a nenhuma venda.
- **Fix:** Gerar referência em `CheckoutPage` antes de `createVenda`, passar ao INSERT e ao email.
- **Estado:** ❌ Por corrigir

---

## MÉDIO — Degradam qualidade ou manutenção

### F9 — schema.sql desactualizado ✅ (resolvido em 2026-04-13)
- **Ficheiro:** `supabase/schema.sql`
- **Causa:** Tem `stripe_id` em vez de `stripe_session_id`; sem `metodo_pagamento`, `referencia`.
- **Impacto:** Setup de ambiente novo a partir do schema cria BD incompatível com o código.
- **Fix aplicado:** `supabase/schema.sql` marcado como legado e bloqueado com `RAISE EXCEPTION`; fonte de verdade definida em `supabase/migrations` + `database.types.ts`.
- **Estado:** ✅ Resolvido

### F10 — Chamada directa Supabase em CheckoutPage ❌
- **Ficheiro:** `src/pages/CheckoutPage.tsx:83-84`
- **Causa:** `supabase.from("obras")` directamente no componente, violando regra do CLAUDE.md.
- **Fix:** Mover para função `getObrasDisponiveis(ids)` em `db.ts`.
- **Estado:** ❌ Por corrigir

### F11 — CORS inconsistente entre Edge Functions ❌
- **Ficheiro:** `supabase/functions/send-email/index.ts:11`
- **Causa:** Falta `http://localhost:4173` na whitelist de `send-email`.
- **Fix:** Adicionar à lista `ALLOWED_ORIGINS`.
- **Estado:** ❌ Por corrigir

---

## SEGURANÇA — ver [[06_SECURITY]] para detalhe

| Ref | Descrição | Estado |
|-----|-----------|--------|
| SC1 | ProtectedRoute aceita user_metadata.role | ✅ (resolvido em 2026-04-13) |
| SC2 | Faltam CSP + HSTS em vercel.json | ❌ |
| SC3 | admins table pública | ❌ |
| SC4 | Sem rate limiting em formulários | ❌ |
| SC5 | Upload sem validação de tipo/tamanho | ❌ |

---

## SEO — ver [[07_SEO_PERFORMANCE]]

| Ref | Descrição | Estado |
|-----|-----------|--------|
| S1 | og:image URL relativa | ❌ |
| S3 | Sitemap 404 (rewrite para /api/sitemap inexistente) | ❌ |

---

## Legenda

- ❌ Por corrigir
- 🔧 Em curso
- ✅ Resolvido — adicionar data e commit
