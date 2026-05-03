# 11 — Deploy, Env Vars e Domínios

## Plataforma actual

- **Frontend:** Vercel (SPA)
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **Email:** Resend
- **Pagamentos:** Stripe
- **Em transição para:** Hostinger (frontend)

---

## Variáveis de ambiente — Frontend (`.env.local`)

| Variável | Onde usar | Observação |
|----------|-----------|-----------|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts` | Público — URL do projecto |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts` | Público — key anon (RLS protege) |
| `VITE_PUBLIC_SITE_URL` | `src/lib/site.ts`, `useSEO.ts` | Fonte de verdade do URL público/canónico no frontend |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `src/lib/stripe.ts` | Público — `pk_test_*` agora; `pk_live_*` em produção |
| `VITE_ADMIN_EMAIL` | hardcoded em múltiplos locais | Redundante — admin definido na tabela `admins` |

⚠️ Verificar que `.env.local` está em `.gitignore`.

### Observabilidade

- Frontend usa `src/lib/observability.ts` e envia erros do browser para a Edge Function `report-client-error`
- Não precisa de secret no browser
- Forward para Sentry é opcional e server-side, via `SENTRY_DSN`

---

## Secrets Supabase Edge Functions

Configurar em: Supabase Dashboard → Edge Functions → Secrets (ou `npx supabase secrets set KEY=VALUE`)

| Secret | Usado em | Obrigatório |
|--------|----------|-------------|
| `STRIPE_SECRET_KEY` | create-checkout-session, stripe-webhook | ✅ |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook | ✅ |
| `SITE_URL` | create-checkout-session (success/cancel URL) | ✅ |
| `ALLOWED_ORIGINS` | create-checkout-session, create-transfer-order, send-email | ✅ recomendado |
| `SUPABASE_URL` | todas as Edge Fns | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | todas as Edge Fns | ✅ |
| `RESEND_API_KEY` | stripe-webhook, send-email | ✅ |
| `NOTIFY_EMAIL` | stripe-webhook, send-email, notify-contacto | ✅ |
| `IBAN_ATELIER` | send-email | ✅ para transferências |
| `SENTRY_DSN` | observability forwarding opcional nas Edge Functions | opcional |
| `SENTRY_ENVIRONMENT` | tags de ambiente no forwarding Sentry | opcional |

---

## Vercel — configuração actual (`vercel.json`)

```json
rewrites:
  /sitemap.xml → /api/sitemap   ← QUEBRADO (não existe)
  /(*) → /index.html            ← SPA fallback ✅

headers (todos os paths):
  X-Content-Type-Options: nosniff ✅
  X-Frame-Options: DENY ✅
  X-XSS-Protection: 1; mode=block ✅
  Referrer-Policy: strict-origin-when-cross-origin ✅

headers /assets/*:
  Cache-Control: public, max-age=31536000, immutable ✅
```

**Faltam:** CSP, HSTS, Permissions-Policy → ver [[06_SECURITY]].

---

## CORS — Edge Functions

| Edge Fn | Origins permitidos |
|---------|-------------------|
| create-checkout-session | `SITE_URL` + `localhost:5173` + `localhost:4173` + `ALLOWED_ORIGINS` |
| create-transfer-order | `SITE_URL` + `localhost:5173` + `localhost:4173` + `ALLOWED_ORIGINS` |
| send-email | `SITE_URL` + `localhost:5173` + `localhost:4173` + `ALLOWED_ORIGINS` |
| stripe-webhook | N/A (server-to-server, sem CORS) |
| notify-contacto | N/A (trigger de BD) |

---

## Supabase Auth

- Provider: email/password
- **Email verification:** por confirmar se activo ← CRÍTICO para `is_admin()` funcionar
- **MFA:** por activar para conta admin
- Redirect URLs configuradas: por confirmar

---

## Stripe

- **Webhook endpoint:** `https://vqunmqtozykwqtmyfjyi.supabase.co/functions/v1/stripe-webhook`
- **Eventos subscritos:** `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
- **Modo actual:** teste (`pk_test_*`)
- **API version:** `2024-06-20` (fixada nas Edge Fns)

---

## Domínios

| Domínio | Uso | Estado |
|---------|-----|--------|
| `ana-alexandre.pt` | produção canónica (frontend + SEO + Stripe redirects) | fonte de verdade actual |
| `atelieranaalexandre.pt` | legado / compatibilidade opcional via `ALLOWED_ORIGINS` | não canónico |
| `ana-alexandre.pt` | email Resend (`noreply@ana-alexandre.pt`) | por confirmar se verificado |
| `vqunmqtozykwqtmyfjyi.supabase.co` | backend | activo |

---

## Deploy de Edge Functions

```bash
# Todas de uma vez:
npx supabase functions deploy --all

# Individual:
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-email
npx supabase functions deploy notify-contacto
```

---

## Migração para Hostinger

Quando migrar o frontend para Hostinger:
1. Criar `.htaccess` para SPA rewrite:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
2. Actualizar `SITE_URL` nos secrets Supabase
3. Actualizar `ALLOWED_ORIGINS` nos secrets Supabase
4. Actualizar webhook endpoint no Stripe Dashboard (se domínio mudar)
5. Actualizar `success_url` e `cancel_url` na Edge Fn (via `SITE_URL`)
6. Re-verificar domínio Resend se email mudar

---

## Build e deploy

```bash
npm run build        # → dist/
# Vercel: auto-deploy em push para main
# Hostinger: fazer upload de dist/ via FTP ou CI
```
