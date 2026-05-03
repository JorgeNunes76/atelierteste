# 02 — Arquitectura do Sistema

## Diagrama simplificado

```
Browser (SPA)
│
├── src/lib/                    CAMADA DE SERVIÇOS (regra: sempre usar isto)
│   ├── supabase.ts             cliente Supabase (anon key, client-side)
│   ├── db.ts                   TODO o acesso à BD — funções exportadas
│   ├── auth.ts                 wrapper Auth + hook useSession()
│   ├── cart.tsx                Context do carrinho (localStorage)
│   ├── stripe.ts               chama Edge Fn + redireciona
│   ├── email.ts                chama Edge Fn send-email
│   ├── tokens.ts               GOLD, CHARCOAL, CREAM, SLATE
│   └── mappers.ts              estadoMap, classifyTecnica
│
├── src/pages/                  PÁGINAS (rotas públicas e protegidas)
├── src/features/admin/         PAINEL ADMIN (protegido por ProtectedRoute)
└── src/app/routes.tsx          ROUTING (lazy, RequireAuth, ProtectedRoute)

Supabase (backend)
│
├── PostgreSQL                  5 tabelas + tabela admins
├── Edge Functions (Deno)       4 funções — ver abaixo
├── Auth                        email/password + JWT
└── Storage                     bucket "obras" (imagens públicas)

Stripe          → sessão criada na Edge Fn; webhook recebido na Edge Fn
Resend          → email chamado via Edge Fn (nunca directamente do browser)
Vercel/Hostinger → SPA rewrite (/* → index.html) + headers de segurança
```

## Routing

Ficheiro: `src/app/routes.tsx`

| Rota | Protecção | Componente |
|------|-----------|-----------|
| `/` | público | Layout → HomePage |
| `/galeria` | público | GaleriaPage |
| `/galeria/:id` | público | ObraPage |
| `/sobre`, `/mentoria`, `/contactos` | público | páginas estáticas |
| `/carrinho` | público | CarrinhoPage |
| `/checkout` | `RequireAuth` | CheckoutPage |
| `/sucesso` | público | SucessoPage |
| `/login`, `/register` | público | LoginPage, RegisterPage |
| `/recuperar-password`, `/reset-password` | público | RecoverPasswordPage, ResetPasswordPage |
| `/admin/*` | `ProtectedRoute` (admin) | AdminLayout → views |
| `*` | público | 404 fallback |

## Edge Functions (Supabase Deno)

| Função | Trigger | Responsabilidade |
|--------|---------|-----------------|
| `create-checkout-session` | POST do browser | Valida preços, cria venda pendente, gera sessão Stripe |
| `stripe-webhook` | POST do Stripe | Processa completed/expired/failed, actualiza venda+obras, envia email |
| `send-email` | POST do browser | Dispatcher Resend (transfer_order, contact_confirmation) |
| `notify-contacto` | DB webhook (trigger manual) | Notifica admin por email em novo contacto |

## Ficheiros críticos (por ordem de importância)

```
supabase/functions/create-checkout-session/index.ts  ← coração do pagamento
supabase/functions/stripe-webhook/index.ts           ← estado final de vendas
src/pages/CheckoutPage.tsx                           ← UI de checkout
src/lib/db.ts                                        ← acesso centralizado à BD
src/lib/stripe.ts                                    ← cliente stripe
supabase/schema.sql                                  ← schema (STALE — ver Bugs)
src/lib/database.types.ts                            ← types gerados (fonte de verdade)
src/app/routes.tsx                                   ← routing
vercel.json                                          ← deploy + headers
```

## Fluxo de checkout por cartão

```
CheckoutPage → [verifica obras disponíveis] → stripe.ts
  → POST create-checkout-session
  → [valida preços DB] → [cria venda pendente] → [cria sessão Stripe]
  → retorna { url }
→ window.location.href = url (Stripe hosted page)
→ Stripe → POST stripe-webhook (completed)
  → UPDATE venda estado='pago'
  → UPDATE obras estado='vendido'
  → POST Resend (recibo cliente + BCC atelier)
```

## Fluxo de checkout por transferência

```
CheckoutPage → [verifica obras disponíveis] → db.createVenda(estado='pendente')
  → [obras ficam 'disponivel' — BUG: não reserva]
  → Promise.all([enviarContacto, sendTransferOrderEmail])
  → clearCart → navigate('/sucesso?transferencia=true')
```
⚠️ Obras não bloqueadas. Ver [[08_BUGS_AND_RISKS]] Falha 4.

## Gestão de sessão / admin

- `useSession()` exportado de `src/lib/auth.ts`
- Admin detectado em `ProtectedRoute.tsx` via `app_metadata.role === 'admin'`  
  ⚠️ Também aceita `user_metadata.role` — bug de segurança, ver [[06_SECURITY]]
- `is_admin()` function SQL (SECURITY DEFINER) usada em todas as RLS policies de escrita
