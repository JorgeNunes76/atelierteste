# CLAUDE.md
> Actualizado: 2026-04-13

## Projecto

**Atelier Ana Alexandre** — loja de arte online. Vite + React 18 SPA (não Next.js), deployada na Vercel.
Artista gere obras, vê mensagens, confirma vendas. Clientes vêem galeria e compram.

**Stack**: React 18 + TypeScript + Vite · React Router v7 · Supabase (DB + Auth + Storage + Edge Functions) · Stripe Checkout · Resend (emails) · Tailwind CSS · motion v12 · Recharts
**Repo**: `https://github.com/AfonsoNunes03/Atelieranaalexandre`
**Supabase ID**: `vqunmqtozykwqtmyfjyi`
**Stripe**: actualmente em modo **teste**. Trocar chaves para live antes do lançamento.

---

## Comandos

```bash
npm run dev      # Vite dev server
npm run build    # build produção → dist/
npm test         # Vitest — suite de regressão crítica (15 testes)

# Após alterar schema BD:
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts

# Deploy Edge Functions:
npx supabase functions deploy --all
```

---

## Arquitetura — onde está cada coisa

### Routing e Guards
- `src/app/routes.tsx` — SPA com lazy loading por rota
- `ProtectedRoute` — acesso admin via `session.user.app_metadata.role === 'admin'` (**não** `user_metadata`)
- `RequireAuth` — exige sessão de cliente autenticado (ex: /checkout)

### Acesso a Dados — REGRAS ABSOLUTAS
1. **DB**: SEMPRE via `src/lib/db.ts`. NUNCA `supabase.from()` directo em componentes.
2. **Auth**: SEMPRE via `src/lib/auth.ts`. Sessão partilhada via `useSession()`.
3. **Edge Functions públicas**: usar `invokePublicFunction()` definido em `db.ts`.
4. **NUNCA** enviar `total`, `preco`, `estado`, `stripe_session_id` ou `email_estado` do frontend. O servidor recalcula tudo.
5. **`createVenda()` em `db.ts` é código morto** — a policy pública de insert em `vendas` foi removida. Não invocar nem expandir.

### Edge Functions (Supabase — todas usam service_role)
| Função | Responsabilidade |
|--------|-----------------|
| `create-checkout-session` | Reserva atómica (RPC `FOR UPDATE`) + sessão Stripe |
| `stripe-webhook` | Processamento de pagamento/expiração; assinatura verificada; idempotente via `email_estado` |
| `create-transfer-order` | Encomenda manual; total recalculado server-side; whitelist de campos |
| `submit-contact` | Honeypot + timing check + rate limit + dedupe |
| `subscribe-newsletter` | Rate limit por IP:email |
| `report-client-error` | Ingestão de erros de browser; rate limited; forwarding Sentry opcional |
| `send-email` | Função auxiliar de email (vestigial — usar Resend directamente nos edge functions acima) |

### Shared modules (`supabase/functions/_shared/`)
- `site-config.ts` — CORS, allowed origins, siteUrl canónico
- `observability.ts` — `logEvent`, `captureException`, `createRequestId`
- `public-form-guards.ts` — `consumeRateLimit` via tabela `public_form_submissions`

### Design System
- Cores: `src/lib/tokens.ts` → `GOLD`, `CHARCOAL`, `CREAM`, `SLATE`. NUNCA redefinir localmente.
- Animações: `motion/react`. NUNCA `framer-motion`.
- Carrinho: `useCart()` de `src/lib/cart.tsx` — persistente em localStorage.
- Mappers: `src/lib/mappers.ts` → `estadoMap`, `classifyTecnica`.
- CMS content: `src/lib/siteContent.ts` → defaults, whitelist, sanitização (secções: geral/homepage/sobre/contacto/pagamentos).

---

## Segurança — regras críticas

- Admin auth usa `app_metadata.role` (imutável pelo cliente), nunca `user_metadata.role`.
- Webhook Stripe **sempre** verifica assinatura via `STRIPE_WEBHOOK_SECRET`. Nunca confiar só no payload.
- Trigger `tg_vendas_insert_guard` força `estado='pendente'` e `stripe_session_id=NULL` em todo insert em `vendas`.
- RPC `reserve_obras_and_create_venda` usa `SELECT FOR UPDATE` — chama apenas via `service_role` no edge function.
- Upload de imagens: validar mime (`jpeg/png/webp/avif`) e tamanho (max 8MB) antes de qualquer upload.
- Rate limiting de formulários públicos via `public_form_submissions` (não contar com RLS para isso).

---

## Schema e Migrations

**Fonte de verdade**: `supabase/migrations/*.sql` + `src/lib/database.types.ts`

`supabase/schema.sql` está **LEGADO e BLOQUEADO** (contém `RAISE EXCEPTION` no topo). Não executar.

Migrations activas — aplicar nesta ordem em produção:
```
1. 20260413_vendas_rls_hardening.sql       ← remove insert público + trigger guard
2. 20260413_atomic_reservation.sql         ← obras.reserved_until + RPC reserva atómica
3. 20260413_vendas_email_estado.sql        ← vendas.email_estado + CHECK constraint
4. 20260413_public_form_submissions.sql    ← tabela rate limiting
5. 20260413_admins_read_hardening.sql      ← remove leitura pública de admins
6. 20260413_form_policies_hardening.sql    ← drop insert público em contactos e newsletter
```

---

## Vault e Documentação
- `Atelier_brain/14_SESSION_HANDOFF.md` — estado actual, blockers, próximos passos por sessão
- `PROJECT_STATE.md` — snapshot técnico completo (arquitetura, segurança, fluxos)
