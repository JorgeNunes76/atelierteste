# 06 — Segurança

## Postura geral

- RLS activado em todas as tabelas ✅
- Edge Functions com service role key (server-side only) ✅
- Preços validados server-side no cartão ✅
- Webhook Stripe com signature verification ✅
- HTML emails com `escHtml()` nos templates ✅
- Frontend usa anon key (intencionalmente pública) ✅

---

## Riscos por severidade

### CRÍTICO

**SC1 — ProtectedRoute aceita `user_metadata.role`**
**Estado:** Resolvido ✅
**Risco:** O frontend `ProtectedRoute.tsx` aceitava `user_metadata.role` (modificável pelo cliente via `supabase.auth.updateUser`).
**Ação:** Refactor para usar exclusivamente `app_metadata.role` (claims seguras do servidor).

**SC2 — Headers de segurança incompletos** (`vercel.json`)
**Estado:** Resolvido ✅
Presentes: `CSP`, `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`.

**SC3 — `admins` table legível publicamente**
**Estado:** Resolvido ✅
**Fix:** `USING (is_admin())` via migration `20260413_admins_read_hardening.sql`.

### ALTO

**SC4 — Sem rate limiting em formulários públicos**
- Estado actual: mitigado nos fluxos públicos principais
- `contactos` e `newsletter` passam agora por Edge Functions em vez de insert directo do browser
- Existe honeypot no contacto e rate limit leve por email/IP via tabela `public_form_submissions`
- `create-transfer-order` também ganhou rate limit leve e dedupe de pedidos recentes
- Residual: protecção básica contra flooding simples; não substitui WAF/captcha se o volume subir

**SC5 — Upload de imagens sem validação**
**Estado:** Resolvido ✅ (Validado em `db.ts`)
`uploadObraImage()` e `uploadSiteImage()` validam tipo MIME e tamanho máximo de 8MB.

**SC6 — Sem 2FA para admin**
Conta admin comprometida = acesso total. Supabase suporta TOTP/MFA — activar no Dashboard.

### MÉDIO

**SC7 — `stripe.ts` não valida URL de redirect**
```typescript
window.location.href = url;  // url vem da Edge Fn
```
Mitigação: a Edge Fn só gera URLs Stripe. Fix defensivo: validar `url.startsWith("https://checkout.stripe.com")`.

**SC8 — `send-email` CORS não inclui `localhost:4173`**
Build preview não consegue chamar a Edge Fn de email. Menor em segurança, impacto em testes.

**SC9 — Sem `HSTS` header**
**Estado:** Resolvido ✅ (Adicionado a `vercel.json`)

### BAIXO

**SC10 — `nif` concatenado na `morada`**
NIF do cliente é concatenado como string em `morada` (`| NIF: 123456789`). Informação fiscal misturada com morada. Melhor: coluna separada `nif` (por confirmar se existe).

---

## CSP recomendado para vercel.json

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; img-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://api.stripe.com; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
}
```

## HSTS recomendado

```json
{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" }
```

## RLS — pontos de atenção

- `vendas_client_read`: `cliente_email = auth.jwt() ->> 'email'` — funciona apenas com email verificado
- `is_admin()` refactorizado para usar `app_metadata.role` em vez de lookup na tabela `admins` (Migration `20260415_is_admin_metadata.sql`).
- Garantir que "Confirm Email" está activo no Supabase Auth Settings

## Segredos sensíveis

| Secret | Localização correcta | Estado |
|--------|---------------------|--------|
| `STRIPE_SECRET_KEY` | Supabase secrets | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Supabase secrets | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets (Edge Fn) | ✅ |
| `RESEND_API_KEY` | Supabase secrets | ✅ |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` (público intencionalmente) | ✅ |
| `.env.local` | **Não commitado?** | ⚠️ Verificar .gitignore |


