# 01 — Project Overview

## O que é

Loja de arte online para a artista **Ana Alexandre**. Obras únicas (1 por obra). Venda directa ao cliente com Stripe ou transferência bancária. Artista gere tudo via painel admin.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Vite + React 18 + TypeScript |
| Routing | React Router v7 (SPA, code-split lazy) |
| Animações | `motion/react` v12 — **não usar framer-motion** |
| Estilos | Tailwind CSS + design tokens em `src/lib/tokens.ts` |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions Deno) |
| Pagamentos | Stripe (hosted checkout) |
| Email | Resend via Edge Function |
| Deploy | Vercel (SPA rewrite) → em transição para Hostinger |
| Linguagem | Português (PT) — i18n configurado mas não activo por defeito |
| Charts | Recharts (admin dashboard) |

## Domínio / Repositório

- **Repo GitHub:** `https://github.com/AfonsoNunes03/Atelieranaalexandre`
- **Domínio produção:** `atelieranaalexandre.pt` (por confirmar se ainda Vercel ou já Hostinger)
- **Supabase URL:** `https://vqunmqtozykwqtmyfjyi.supabase.co`

## Utilizadores

| Perfil | Acesso |
|--------|--------|
| Admin (artista) | Rota `/admin` — CRUD obras, vendas, mensagens, config |
| Cliente | Galeria, obra individual, carrinho, checkout (requer login) |
| Visitante | Galeria, páginas estáticas — sem login necessário |

## Estado actual (2026-04-13)

- ✅ Galeria dinâmica com obras reais
- ✅ Admin dashboard com estatísticas reais (Recharts)
- ✅ Auth funcional (admin + clientes)
- ✅ Fluxo Stripe estruturado
- ❌ **Checkout por cartão quebrado** (bug payload key — ver [[08_BUGS_AND_RISKS]])
- ❌ Stripe em modo teste (`pk_test_*`)
- ❌ IBAN/MBWay placeholder no código
- ❌ Race condition em stock
- 🔧 Em curso: auditoria e correcção de bugs críticos antes de ir a produção

## Regras de desenvolvimento

1. Acesso à BD: **sempre via** `src/lib/db.ts`
2. Auth: **sempre via** `src/lib/auth.ts` + `useSession()`
3. Animações: importar de `motion/react` (nunca `framer-motion`)
4. Carrinho: `useCart()` de `src/lib/cart.tsx`
5. Design tokens: `src/lib/tokens.ts` — nunca redefinir cores localmente
6. Mapeamento de obras: `src/lib/mappers.ts`

## Comandos úteis

```bash
npm run dev       # dev server (porta 5173)
npm run build     # build produção → dist/
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts
npx supabase functions deploy --all
```
