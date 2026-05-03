# PROJECT_STATE

## 1. Overview do Projeto
- Website institucional + e-commerce de obras únicas da artista Ana Alexandre.
- Objetivo principal: apresentar portefólio, vender obras originais (Stripe/transferência), gerir operação via painel admin.
- Stack atual:
  - Frontend: React 18 + Vite + TypeScript + React Router + Tailwind.
  - Backend: Supabase (Postgres + Edge Functions Deno + Storage + Auth).
  - Pagamentos: Stripe Checkout + webhooks (`checkout.session.completed` / `checkout.session.expired`).
  - Infra: Vercel (SPA + API serverless para sitemap/meta social), Supabase Cloud.

## 2. Arquitetura Atual
- Frontend:
  - SPA com rotas lazy em `src/app/routes.tsx`.
  - Checkout em `/checkout` protegido por auth (`RequireAuth`).
  - Admin em `/admin` protegido por `ProtectedRoute`.
- **Fase de Lançamento (Landing Page)**:
  - Uma versão estática e de alta fidelidade reside em `/landing-page`.
  - Objetivo: Lançamento imediato e seguro com conversão direta para WhatsApp.
  - Substitui temporariamente o e-commerce completo enquanto se valida a operação manual.
- Backend / Edge Functions:
  - `create-checkout-session`: reserva atómica + criação sessão Stripe.
  - `stripe-webhook`: reconciliação de pagamento/expiração + idempotência parcial.
  - `create-transfer-order`: encomenda manual/transferência com validação server-side.
  - `submit-contact` e `subscribe-newsletter`: validação + rate limit + anti-spam.
  - `report-client-error`: ingestão de erros de browser.
- Supabase (tabelas principais):
  - `obras`, `vendas`, `contactos`, `newsletter`, `config_site`, `admins`, `public_form_submissions`.
  - Migrations recentes confirmadas para reservas atómicas, hardening `vendas` e `email_estado`.
  - RLS: ativa nas tabelas base; `schema.sql` está desatualizado vs migrations recentes (usar migrations + `database.types.ts` como fonte atual).
- Stripe:
  - Sessão criada server-side com metadata `venda_id`.
  - `stripe_session_id` persistido em `vendas`.
  - Webhook valida assinatura (`STRIPE_WEBHOOK_SECRET`).
- Storage (imagens):
  - Bucket `obras` para imagens de obras e conteúdo (`site/...`).
  - Upload admin com validação de tipo/tamanho no frontend.

## 3. Fluxos Críticos
- Checkout (Stripe):
  - Frontend envia `itemIds` para `create-checkout-session`.
  - Backend chama RPC `reserve_obras_and_create_venda` (atomicidade com `FOR UPDATE`).
  - Cria sessão Stripe, guarda `stripe_session_id`; se falhar, faz rollback.
- Criação de vendas:
  - Cartão: via RPC + update `stripe_session_id`.
  - Transferência: via `create-transfer-order`, total recalculado server-side.
- Reservas de obras:
  - `obras.estado='reservado'` + `reserved_until`.
  - Libertação por webhook `expired` e função `release_expired_reservations` (backup).
- Webhooks:
  - `completed`: promove `pendente/cancelado -> pago` quando sessão está efetivamente paga; marca obras `vendido`; gere `email_estado`.
  - `expired`: confirma sessão no Stripe antes de libertar; só cancela/liberta quando válido.
- Encomendas manuais:
  - Validação estrita de payload + whitelist de método + rate limit + dedupe temporal.
- Contacto:
  - Honeypot (`website`), timing check (`submitted_at`), rate limit e dedupe.

## 4. Estado das Funcionalidades
- Checkout / Pagamentos: ✔️ concluído (fluxo server-side robusto, com rollback e reserva).
- Webhooks: ⚠️ parcial (muito mais robustos; falta evidência de suite automatizada de regressão idempotência/order).
- Segurança / RLS: ✔️ concluído (migração para app_metadata.role e hardening de RLS/headers finalizado).
- Validação backend: ✔️ concluído nos fluxos públicos críticos (checkout/manual/contact/newsletter).
- Dashboard / Obras: ✔️ concluído (CRUD e gestão operacional ativos).
- Conteúdo (CMS): ⚠️ parcial (secção `Conteúdo` existe; integração pública ainda não cobre 100% dos textos hardcoded).
- SEO / Social preview: ✔️ concluído para páginas de obra (metadados server-side via Vercel function).
- Performance: ⚠️ parcial (lazy routes/chunks melhorados; sem pipeline de otimização de imagens em infraestrutura).
- Observabilidade: ⚠️ parcial (captura frontend + logs estruturados + forwarding opcional Sentry; cobertura operacional ainda depende de configuração prod).

## 5. Problemas Conhecidos
- `supabase/schema.sql` está desatualizado (ex.: `stripe_id`, policy pública de insert em `vendas`) face ao estado real atual.
- Integração CMS ainda parcial em páginas públicas (há blocos de copy hardcoded).
- Não há suíte automatizada abrangente para fluxos críticos Stripe/race conditions (por confirmar: existência fora do repo atual).

## 6. Segurança
- Pontos fortes:
  - Validação server-side forte em funções públicas.
  - Recalculo de total no backend e bloqueio de campos internos.
  - Webhook Stripe com verificação de assinatura.
  - Guardas de origem/CORS centralizados em edge functions.
  - RLS e uso de `service_role` apenas no backend.
- Vulnerabilidades potenciais:
    - Drift entre `schema.sql` e migrations aumenta risco operacional de deploy incorreto.
  - Logs de algumas funções ainda via `console.*` em vez de padrão estruturado completo.
- Validação atual:
  - Checkout/manual/contact/newsletter não confiam no frontend.
- Riscos de produção:
  - Reaplicação de schema errado.
  - Configuração de secrets/env incompleta (Stripe/Resend/Sentry) degradar fluxos.

## 7. Dados e Modelos
- `obras` (principal):
  - Campos relevantes: `id`, `titulo`, `tecnica`, `preco`, `estado`, `imagem_url`, `slug`, `destaque`, `ordem`, `reserved_until`.
  - Estados usados: `disponivel`, `reservado`, `vendido`.
- `vendas` (principal):
  - Campos relevantes: `id`, `cliente_*`, `items` (json), `total`, `estado`, `metodo_pagamento`, `stripe_session_id`, `referencia`, `email_estado`.
  - Estados usados: `pendente`, `pago`, `enviado`, `cancelado`.
  - `email_estado`: `pendente | enviando | enviado | retry_needed`.
- Outros dados:
  - `config_site`: chave/valor para conteúdo editável.
  - `contactos`, `newsletter`, `public_form_submissions` (anti-flood).
- Storage:
  - Bucket `obras` com leitura pública e escrita admin; também usado para imagens CMS (`site/`).

## 8. Deploy e Ambiente
- Domínio canónico:
  - Fonte de verdade: `SITE_URL` (server) e `VITE_PUBLIC_SITE_URL` (client).
  - Fallback codificado: `https://ana-alexandre.pt`.
- CORS/origins:
  - Centralizado em `supabase/functions/_shared/site-config.ts`.
  - Inclui canónico + localhost + `ALLOWED_ORIGINS`.
- Env vars críticas:
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_PUBLIC_SITE_URL`.
  - Edge/Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `ALLOWED_ORIGINS`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `IBAN_ATELIER`, `SENTRY_DSN` (opcional), `SENTRY_ENVIRONMENT` (opcional).
- Dev vs Prod:
  - Dev suportado por localhost origins.
  - Prod depende de secrets completos e webhook Stripe configurado com eventos corretos.

## 9. O que já foi melhorado
- Reserva atómica server-side com RPC e `FOR UPDATE`.
- Campo `reserved_until` + função de libertação de reservas expiradas.
- Correlação de venda por `stripe_session_id`.
- Hardening de webhooks para eventos fora de ordem e retries.
- `email_estado` para tratar falhas parciais de email sem perder consistência da venda.
- Endurecimento de encomendas manuais (recalculo total, whitelist método, campos proibidos).
- Formulários públicos com lock submit, honeypot (contacto) e rate limiting.
- Normalização de domínio/CORS e URLs absolutas (SEO/Stripe).
- SEO social de obras com metadata server-side (`api/obra-meta` + rewrite crawler).
- Captura de erros client-side + ingestão server-side com contexto.
- CMS base no admin (`Conteúdo`) com campos controlados e sanitização.

## 10. O que falta fazer
- Alinhar `supabase/schema.sql` com migrations atuais (ou descontinuar uso direto).
- Completar integração CMS em todas as páginas/sectores ainda hardcoded.
- Criar testes automatizados prioritários para:
  - race condition checkout,
  - ordering `expired/completed`,
  - idempotência de webhook.
- Rever cobertura de logs estruturados em todas as edge functions.

## 11. Blockers de Lançamento
- Blockers operacionais:
  - Ausência de regressão automatizada mínima para pagamentos/webhooks.
  - Drift documental (`schema.sql`) com risco de erro em ambientes novos.

## 12. Próximos Passos (Top 10)
2. Criar testes automatizados para webhooks (`completed`, `expired`, out-of-order, retries).
3. Criar teste concorrente para dupla tentativa de compra da mesma obra.
4. Consolidar `schema.sql` com migrations reais (ou marcar como legado explicitamente).
5. Completar binding CMS nas páginas ainda hardcoded.
6. Validar produção com Stripe CLI (eventos reais de regressão).
7. Validar `release_expired_reservations` por agendamento (pg_cron ou rotina operacional).
8. Revisão final de logs para correlação (`request_id`, `venda_id`, `stripe_session_id`, `obra_ids`).
9. Executar checklist mobile/desktop focada em checkout e formulários.
10. Lançamento da Landing Page: Deploy do conteúdo de `/landing-page` no domínio da Hostinger.
11. Monitorização de leads via WhatsApp e preparação para fase 2 (Automação).

## 13. Avaliação Final
- Estado atual: **PRONTO PARA LANÇAMENTO (Fase 1: Landing Page)**.
- Justificação objetiva:
  - Foi criada uma landing page premium em `/landing-page` para lançamento imediato via Hostinger.
  - O e-commerce completo está endurecido e pronto, mas será ativado numa segunda fase após validação da procura manual via WhatsApp.

---

## Security Notes
- Não confiar em metadados mutáveis de cliente para autorização (`user_metadata`).
- Preservar validação server-side como fonte de verdade para preços, estado e stock.
- Não aplicar `supabase/schema.sql` atual em ambiente novo sem reconciliação com migrations de 2026-04-13.
