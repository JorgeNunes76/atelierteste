# 09 — Roadmap

> Baseado na auditoria de 2026-04-13.
> Organizado em fases sequenciais. Cada fase tem dependências das anteriores.

---

## FASE A — Desbloquear pagamento por cartão
**Sem esta fase, nenhuma venda é possível.**

- [ ] **A1** `src/lib/stripe.ts:42` — mudar `items: itemIds` para `itemIds: itemIds`
- [ ] **A2** `create-checkout-session/index.ts:57` — remover fallback legado, manter apenas `body.itemIds`
- [ ] Testar: abrir checkout, seleccionar cartão, verificar logs Edge Fn Supabase

---

## FASE B — Integridade transacional (cartão)
**Depende de Fase A.**

- [ ] **B1** Migration SQL: criar índice em `vendas.stripe_session_id`
- [ ] **B2** `create-checkout-session` — lock optimista: UPDATE obras SET estado='reservado' WHERE estado='disponivel' antes de criar venda
- [ ] **B2** `create-checkout-session` — após criar sessão Stripe, UPDATE venda SET stripe_session_id = session.id
- [ ] **B3** `stripe-webhook` handler `expired` — usar `session.metadata.venda_id` em vez de `.eq("stripe_session_id")`
- [ ] **B3** handler `expired` — libertar obras de 'reservado' para 'disponivel'
- [ ] Testar: race condition com 2 abas, sessão expirada

---

## FASE C — Idempotência do webhook
**Independente, pode fazer-se em qualquer altura antes de live keys.**

- [ ] **C1** `stripe-webhook` — adicionar `.eq("estado", "pendente")` ao UPDATE da venda
- [ ] **C1** — só enviar email se `vendaData !== null` (transição confirmada)
- [ ] Testar: reenviar webhook no Stripe Dashboard, verificar que email não duplica

---

## FASE D — Integridade do fluxo de transferência
**Independente de B/C.**

- [ ] **D1** Inserir `bank_iban`, `bank_titular`, `bank_mbway` na tabela `config_site` com valores reais
- [ ] **D1** `CheckoutPage.tsx` — ler BANK de `config_site` via `getConfig()` em vez de const hardcoded
- [ ] **D2** `CheckoutPage.tsx` — após `createVenda`, chamar `updateObraStatus(id, 'reservado')` para cada obra
- [ ] **D3** Gerar `referencia = 'ARTE-' + ...` em `CheckoutPage` antes do INSERT; passar ao `createVenda` e ao email
- [ ] **D3** `send-email/index.ts` — receber `referencia` do payload em vez de gerar localmente
- [ ] **D4** `CheckoutPage.tsx` — chamar `clearCart()` imediatamente após `createVenda`; emails como best-effort
- [ ] Testar: fluxo completo de transferência, verificar referência na venda

---

## FASE E — Segurança (antes de go-live)

- [x] **E1** `ProtectedRoute.tsx` — remover check `user_metadata.role` (2026-04-13)
- [ ] **E2** `vercel.json` — adicionar CSP + HSTS headers
- [x] **E3** `supabase/schema.sql` — marcado como legado/bloqueado; fonte de verdade migrações + `database.types.ts` (2026-04-13)
- [ ] **E4** Supabase Dashboard — activar "Confirm Email" em Auth Settings
- [ ] **E5** Supabase Dashboard — activar MFA/TOTP para conta admin
- [ ] **E6** SQL — fix policy `admins_read`: `USING (is_admin())` em vez de `USING (true)`
- [ ] **E7** `send-email/index.ts` — adicionar `localhost:4173` ao CORS

---

## FASE F — SEO mínimo

- [ ] **F1** `index.html` — `og:image` para URL absoluta
- [ ] **F2** Criar `public/sitemap.xml` estático com rotas públicas
- [ ] **F3** `vercel.json` — remover rewrite `/sitemap.xml → /api/sitemap` (ou substituir por sitemap estático)

---

## FASE G — Qualidade e manutenção

- [ ] **G1** `CheckoutPage.tsx:83` — mover query directa para `db.ts` (`getObrasDisponiveis`)
- [ ] **G2** `db.ts` — standardizar `getObras()` e `getObrasDestaque()` para lançar erro em vez de retornar `[]`
- [ ] **G3** `db.ts` — validação de tipo/tamanho em `uploadObraImage()`
- [ ] **G4** Adicionar Error Boundary global na SPA
- [ ] **G5** Configurar limpeza automática de vendas `pendente` antigas (pg_cron ou Vercel Cron)

---

## FASE H — Go-live (Hostinger)

- [ ] Substituir chaves Stripe teste por live (`pk_live_*`, `sk_live_*`)
- [ ] Configurar `.htaccess` para SPA rewrite no Hostinger
- [ ] Verificar domínio Resend para `noreply@ana-alexandre.pt`
- [ ] Testar webhook Stripe no domínio de produção
- [ ] Verificar `SITE_URL` secret no Supabase aponta para domínio final

---

## Priorização total

```
CRÍTICO (bloqueia produção): A → B → C → D → E → F
PODE ESPERAR:                G → H
```
