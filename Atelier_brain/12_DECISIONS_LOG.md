# 12 — Log de Decisões Técnicas

> Nunca apagar entradas. Adicionar no topo (mais recente primeiro).
> Formato: data · decisão · porquê · alternativas rejeitadas

---

## 2026-04-13 — Auditoria de segurança e integridade transacional

**Decisão:** Manter arquitectura SPA (sem SSR/Next.js) mesmo com limitações de SEO.
**Porquê:** Refactor para Next.js seria demasiado disruptivo para o estado actual. SEO dinâmico por obra é nice-to-have, não bloqueante.
**Alternativas rejeitadas:** Next.js App Router (demasiado breaking change).

---

## 2026-04-13 — Fluxo de lock optimista para obras

**Decisão:** Usar `UPDATE obras SET estado='reservado' WHERE estado='disponivel'` como mecanismo de lock em vez de transacções SQL explícitas.
**Porquê:** Supabase Edge Functions (Deno) não suportam transacções multistatement via REST API. A única forma atómica disponível é o UPDATE com WHERE clause condicional.
**Alternativas rejeitadas:** `FOR UPDATE` lock (requer RPC SQL), transacção XA (não suportada via Supabase JS).

---

## 2026-04-13 — Referência de transferência gerada no cliente

**Decisão:** Gerar `referencia = 'ARTE-' + Date.now().toString(36)` no `CheckoutPage` antes do INSERT, em vez de no servidor ou na Edge Function.
**Porquê:** Simplicidade — o valor precisa de estar na venda E no email; o CheckoutPage é o ponto de entrada de ambos.
**Alternativas rejeitadas:** gerar no banco (trigger SQL), gerar na Edge Function (exigiria Edge Fn para transferências também).

---

## [Data desconhecida] — Centralização de acesso à BD em `db.ts`

**Decisão:** Todo o acesso ao Supabase passa por `src/lib/db.ts`. Componentes nunca chamam `supabase.from()` directamente.
**Porquê:** Facilita auditoria de segurança, mocking em testes, e tratamento de erros centralizado.
**Excepção documentada:** `CheckoutPage.tsx:83` ainda tem chamada directa — bug F10 a corrigir.

---

## [Data desconhecida] — Stripe Hosted Checkout (não Stripe Elements)

**Decisão:** Usar Stripe checkout redirect em vez de Stripe Elements embutido na página.
**Porquê:** Hosted checkout não requer conformidade PCI completa do nosso lado. Mais simples de implementar. Suporta Apple Pay / Google Pay automaticamente.
**Alternativas rejeitadas:** Stripe Elements (requer certificação PCI SAQ A-EP).

---

## [Data desconhecida] — Preços validados server-side (Edge Function)

**Decisão:** A Edge Function `create-checkout-session` busca preços directamente da BD, ignorando os preços enviados pelo cliente.
**Porquê:** Preços no localStorage podem ser manipulados. Validação server-side garante integridade.
**Nota:** O fluxo de transferência ainda usa preço do cliente — inconsistência a resolver.

---

## [Data desconhecida] — `motion/react` em vez de `framer-motion`

**Decisão:** Usar a biblioteca `motion` (v12) importada de `motion/react`.
**Porquê:** `framer-motion` foi rebrandada para `motion`. Versão mais recente e activamente mantida.
**Regra:** Nunca importar de `framer-motion`.

---

## [Data desconhecida] — Supabase Auth em vez de Auth custom

**Decisão:** Autenticação gerida inteiramente pelo Supabase (email/password + JWT).
**Porquê:** Sem necessidade de gerir tokens, refresh, etc. RLS integrado com JWT do Supabase.
**Nota:** Admin identificado via tabela `admins` + função `is_admin()`, não via roles do Supabase.

---

## [Data desconhecida] — Admin identificado por tabela `admins` (não por Supabase roles)

**Decisão:** Verificar admin via `SELECT FROM admins WHERE email = auth.jwt()->>'email'` em vez de usar `app_metadata.role`.
**Porquê:** Mais flexível — adicionar/remover admins é um simples INSERT/DELETE sem tocar em Auth settings.
**Trade-off:** Requer que email esteja verificado para JWT email estar disponível.

---

## [Data desconhecida] — Carrinho em localStorage

**Decisão:** Persistir carrinho em `localStorage` (não no servidor/BD).
**Porquê:** Utilizadores não autenticados podem adicionar ao carrinho. Sem necessidade de BD para estado temporário.
**Trade-off:** Não sincroniza entre dispositivos. Preços no carrinho são display-only; validação server-side ao checkout.
