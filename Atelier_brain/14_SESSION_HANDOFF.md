# 14 — Session Handoff

> Actualizar no fim de cada tarefa importante. Máxima concisão.
> **Lê este ficheiro antes de qualquer acção.**

---

## Estado actual — 2026-04-13

**Fase:** correcção da race condition de obras únicas fechada no código.
**Stripe:** modo teste (`pk_test_*`). Fluxo continua sem vendas reais até troca para live.
**Checkout por cartão:** reserva atómica server-side implementada; faltava só endurecer consistência final.
**Checkout por transferência:** fora deste escopo; continua com work items próprios.

---

## Últimas alterações relevantes

- Migration `20260413_atomic_reservation.sql` adiciona `obras.reserved_until` e RPC `reserve_obras_and_create_venda()`
- `create-checkout-session` já usa a RPC atómica, cria `Checkout Session` com `expires_at` e faz rollback manual se Stripe falhar
- `stripe-webhook` já trata `checkout.session.completed` e `checkout.session.expired`
- `src/lib/stripe.ts` já envia `itemIds`
- Nesta sessão: hardening adicional para evitar estados órfãos e sincronização de `database.types.ts`
- Ordering Stripe resolvido: `completed` pode recuperar `cancelado -> pago` quando a sessão está realmente paga; `expired` confirma o estado real no Stripe antes de libertar stock
- Webhooks endurecidos para retries: `stripe_session_id` passou a ser a correlação principal, e `vendas.email_estado` guarda `pendente/enviando/enviado/retry_needed`
- `create-transfer-order` endurecido: rejeita campos internos, faz whitelist de `metodo_pagamento` e recalcula tudo server-side
- Domínio/CORS normalizados: `ana-alexandre.pt` é o canónico, `SITE_URL`/`VITE_PUBLIC_SITE_URL` são a fonte de verdade, e as Edge Functions partilham a mesma lógica de origins
- Formulários públicos endurecidos: checkout, contactos e newsletter usam lock síncrono antes do state React, `AbortController` e feedback acessível de loading/erro
- `contactos` e `newsletter` deixaram de inserir directamente pela anon key e passam por Edge Functions com honeypot / rate limit leve baseado em `public_form_submissions`

---

## Blockers actuais

| # | Blocker | Impacto |
|---|---------|---------|
| 1 | Stripe em modo teste | Nenhuma venda real |
| 2 | Fluxo de transferência ainda tem tarefas pendentes fora desta sessão | Não afecta o fix de dupla venda em cartão |

---

## Bugs críticos abertos

| ID | Ficheiro | Linha | Descrição | Estado |
|----|---------|-------|-----------|--------|
| F1 | `src/lib/stripe.ts` | 42 | `items` → `itemIds` | ✅ resolvido |
| F2 | `create-checkout-session/index.ts` | fluxo cartão | reserva concorrente / dupla venda | ✅ resolvido via RPC atómica |
| F3 | `stripe-webhook/index.ts` | handler expired | vendas fantasma / stock preso | ✅ resolvido; usa `stripe_session_id` como correlação principal |
| F5 | `stripe-webhook/index.ts` | handler completed | duplicação por retry do Stripe | ✅ resolvido com idempotência + `email_estado` |
| F9 | `database.types.ts` | schema local | faltava `reserved_until` e assinatura das RPCs | ✅ resolvido |
| F10 | `stripe-webhook/index.ts` | ordering de webhooks | `expired` vs `completed` fora de ordem | ✅ resolvido nesta sessão |
| F11 | `create-checkout-session/index.ts` | persistência final | falha em `stripe_session_id` podia deixar sessão órfã | ✅ resolvido nesta sessão |
| F12 | `stripe-webhook/index.ts` | retries do `completed` | recibo podia reenviar em retry/no-op | ✅ resolvido nesta sessão |
| F13 | `stripe-webhook/index.ts` | falha parcial de email | venda/obra ficavam consistentes mas sem marca explícita para retry | ✅ resolvido com `email_estado` |
| F14 | `create-transfer-order/index.ts` | validação de payload | cliente podia tentar enviar campos internos / método adulterado | ✅ resolvido nesta sessão |
| F15 | `ContactosPage` / `submit-contact` | formulário público | double submit e spam básico no contacto | ✅ mitigado nesta sessão |
| F16 | `CheckoutPage` / `create-transfer-order` | transferência | pedido manual podia duplicar por latência UI | ✅ mitigado nesta sessão |
| F17 | `Layout.tsx` / `subscribe-newsletter` | newsletter | submit repetido e sem backend dedicado | ✅ mitigado nesta sessão |

---

## Ficheiros mais sensíveis

```
src/lib/stripe.ts                                   ← F1 aqui (1 linha)
supabase/functions/create-checkout-session/index.ts ← F2, lógica de preços
supabase/functions/stripe-webhook/index.ts          ← F3, F5, stock final
src/pages/CheckoutPage.tsx                          ← F4, F6, F7, F8
src/lib/db.ts                                       ← acesso centralizado à BD
src/lib/database.types.ts                           ← fonte de verdade do schema
vercel.json                                         ← headers de segurança (incompletos)
```

---

## Próximos 3 passos recomendados

### Passo 1 — Aplicar migrations em produção (ordem obrigatória)

Correr no **SQL Editor** do Supabase Dashboard, nesta sequência:

```
1. 20260413_vendas_rls_hardening.sql      ← remove policy insert público + trigger guard
2. 20260413_atomic_reservation.sql        ← obras.reserved_until + RPC reserve_obras_and_create_venda
3. 20260413_vendas_email_estado.sql       ← vendas.email_estado + CHECK constraint (idempotente)
4. 20260413_public_form_submissions.sql   ← tabela rate limiting + policy admin
5. 20260413_admins_read_hardening.sql     ← remove leitura pública da tabela admins
```

Após aplicar: regenerar types localmente:
```bash
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts
```

### Passo 2 — Secrets necessários

Verificar/definir no Dashboard → Settings → Edge Functions → Secrets:

| Secret | Obrigatório | Descrição |
|--------|------------|-----------|
| `STRIPE_SECRET_KEY` | ✅ | Chave Stripe (live ou test) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Segredo do endpoint webhook Stripe |
| `SITE_URL` | ✅ | `https://ana-alexandre.pt` (ou staging URL) |
| `SUPABASE_URL` | auto | Injectado automaticamente |
| `SUPABASE_SERVICE_ROLE_KEY` | auto | Injectado automaticamente |
| `RESEND_API_KEY` | ✅ | Para envio de emails |
| `NOTIFY_EMAIL` | ✅ | Email do atelier para notificações |
| `IBAN_ATELIER` | ✅ | IBAN para instruções de transferência |
| `SENTRY_DSN` | opcional | Forwarding de erros server-side |

### Passo 3 — Deploy das Edge Functions

```bash
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy create-transfer-order
npx supabase functions deploy submit-contact
npx supabase functions deploy subscribe-newsletter
npx supabase functions deploy report-client-error
npx supabase functions deploy send-email
```

Ou de uma vez: `npx supabase functions deploy --all`

### Passo 4 — Stripe Dashboard

No Dashboard Stripe → Developers → Webhooks → editar o endpoint:

Adicionar evento: `checkout.session.expired` (se ainda não estiver na lista)

### Passo 3 — Testes manuais de regressão
```
T1 happy path cartão
T2 checkout.session.expired
T3 corrida concorrente para a mesma obra
T4 ordering fora de ordem: expired antes de completed
T5 retry de completed sem duplicar email/efeitos
```

---

## Comandos / testes úteis

```bash
# Dev server
npm run dev

# Ver logs das Edge Functions em tempo real
# Supabase Dashboard → Functions → Logs

# Testar webhook Stripe
# Stripe Dashboard → Developers → Webhooks → Send test event

# Regenerar types após alterar schema BD
npx supabase gen types typescript --project-id vqunmqtozykwqtmyfjyi > src/lib/database.types.ts

# Deploy Edge Functions
npx supabase functions deploy create-checkout-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy send-email
```

---

## Alertas de regressão

- ⚠️ Qualquer alteração em `create-checkout-session` → testar T1 (cartão happy path) + T3 (race condition)
- ⚠️ Qualquer alteração em `stripe-webhook` → reenviar webhook no Stripe Dashboard; verificar T2 (expired)
- ⚠️ Alterar `CheckoutPage.tsx` → testar T4 (transfer) + T6 (retry sem duplicação)
- ⚠️ Alterar `vercel.json` → fazer `npm run build` + verificar que SPA rewrite funciona
- ⚠️ Alterar `db.ts` → verificar que nenhum componente chama `supabase.from()` directamente

---

## Notas para a próxima sessão

- `supabase/schema.sql` está **desactualizado** — não usar para recriar BD; usar `database.types.ts`
- A coluna `referencia` existe na BD (`database.types.ts:166`) mas nunca é preenchida
- `metodo_pagamento` existe na BD mas `schema.sql` não a tem
- `admins` table tem policy de leitura pública — expõe email do admin
- Verificar se "Confirm Email" está activo no Supabase Auth (necessário para `is_admin()`)
- `ProtectedRoute.tsx` aceita `user_metadata.role` como admin — inseguro, remover
- Fases completas do roadmap: **nenhuma ainda** → ver [[09_ROADMAP]]

- Performance: HomePage deixou de carregar ExposicoesMap e CurvedCarousel no chunk da rota; imagens usam defaults melhores via ImageWithFallback e o build ficou dividido por vendors/componentes pesados
- SEO social de obras: `vercel.json` faz rewrite crawler-only de `/galeria/:slug` para `api/obra-meta.ts`; crawlers recebem metadados server-side por obra sem migrar a stack
- `api/obra-meta.ts` usa `SITE_URL` como fonte de verdade, gera `canonical`, `og:url` e `og:image` absolutos por obra e faz fallback para `/og-image.png`
- `api/sitemap.ts` ficou coerente com a solucao e passou a incluir `image:image` para obras com `imagem_url`
- Observabilidade adicionada: `src/lib/observability.ts` captura `window.error`, `unhandledrejection` e `ErrorBoundary`, enviando para a Edge Function `report-client-error`
- Edge Functions criticas (`create-checkout-session`, `create-transfer-order`, `send-email`, `stripe-webhook`) passam a emitir logs estruturados com `request_id`, `venda_id`, `stripe_session_id` e `obra_ids` quando aplicavel
- `SENTRY_DSN` e `SENTRY_ENVIRONMENT` ficaram suportados como forwarding opcional server-side; sem DSN, os logs estruturados continuam nos logs do Supabase

---

## Update - CMS Conteudo (2026-04-13)

- `Admin > Conteudo` ficou com editor por seccao e chaves controladas (`geral/homepage/sobre/contacto`) usando `SITE_CONTENT_FIELDS`, com sanitizacao por tipo e fallback seguro.
- Nova camada `src/lib/siteContent.ts` define defaults, whitelist de campos editaveis, normalizacao/sanitizacao e helpers (`mailto/tel/morada`).
- `db.uploadSiteImage` agora valida mime-type e tamanho (max 8MB) antes de upload.
- Frontend ja le conteudo dinamico de `config_site` com fallback em:
  - `HomePage` (hero/subtitulo/imagem/processo/bio)
  - `SobrePage` (titulo + imagens principais)
  - `ContactosPage` (email/telefone/morada/instagram + schedule parse)
  - `Layout` footer (contactos e instagram dinamicos)
- Build de producao validado apos alteracoes: `npm run build` concluido com sucesso.

### Limitacoes conhecidas desta entrega

- `SobrePage` ainda tem blocos de texto longos hardcoded por causa de encoding legado em alguns trechos; o editor ja suporta esses campos e faltou apenas alinhar esses blocos de render.
- `ContactosPage` ainda mantem uma frase de subtitulo hardcoded no hero; restante contacto/links ficou dinamico.

---

## Update - CMS publico (2026-04-13)

- `SobrePage` passou a consumir `sobre_texto` e `sobre_texto_2` do CMS (`config_site`) para os blocos longos, com fallback seguro.
- `ContactosPage` passou a consumir `contacto_subtitulo` no hero e `contacto_telefone` no card mobile (com `tel:` dinâmico e linha de horario a partir de `contacto_horario`).
- Layout/estrutura visual mantidos; apenas binding de conteudo textual controlado foi alterado.

---

## Update - Snapshot tecnico global (2026-04-13)

- Foi criado `PROJECT_STATE.md` na raiz do repositorio com estado tecnico completo (arquitetura, fluxos criticos, seguranca, blockers, top 10 proximos passos).
- O snapshot foi baseado no codigo real atual (migrations, edge functions, frontend, vercel/api) e marca pontos incertos como "por confirmar".
- Principais alertas destacados no snapshot:
  - `ProtectedRoute.tsx` ainda aceita `user_metadata.role` para admin (risco de autorizacao).
  - `supabase/schema.sql` esta desatualizado face ao estado real em migrations + `database.types.ts`.
- Estado final consolidado no snapshot: **pronto com reservas** (nao bloqueado por arquitetura, mas com riscos residuais de seguranca/QA para fechar antes de go-live sem reservas).

---

## Update - Admin authorization hardening (2026-04-13)

- Blocker critico SC1 fechado no frontend: `ProtectedRoute.tsx` deixou de aceitar `user_metadata.role` para acesso admin.
- A autorizacao de `/admin` ficou dependente apenas de `session.user.app_metadata.role === 'admin'`.
- Impacto: remove vetor de elevacao de privilegio por metadata mutavel do utilizador.
- Validacao local feita: build de producao (`npm run build`) concluiu com sucesso apos a alteracao.

---

## Update - Suite automatizada critica (2026-04-13)

- Foi adicionada suite minima com Vitest para regressao de pagamentos: `npm test`.
- Cobertura implementada:
  - contrato da reserva atomica (`FOR UPDATE` + RPC de checkout),
  - ordering `completed`/`expired`,
  - idempotencia/retry no webhook,
  - validacao anti-tamper em `create-transfer-order`.
- Resultado atual local: `15/15` testes a passar.
- Limitacao mantida: concorrencia real com DB/Stripe continua em testes manuais (T3 + Stripe CLI).

---

## Update - Drift de schema eliminado (2026-04-13)

- `supabase/schema.sql` foi explicitamente marcado como legado e bloqueado para execucao acidental com `RAISE EXCEPTION`.
- Fonte de verdade formalizada: `supabase/migrations/*.sql` + `src/lib/database.types.ts`.
- Adicionado guia curto `supabase/SCHEMA_SOURCE_OF_TRUTH.md` com fluxo seguro para bootstrap e regeneracao de tipos.

---

## Update - Validacao final pre-launch (2026-04-13)

- Evidencia automatizada atual:
  - `npm test` -> **15/15** testes criticos a passar (race contract, ordering/idempotencia webhook, anti-tamper transfer).
  - `npm run build` -> build de producao concluido sem erros.
- Itens fechados desde `PROJECT_STATE.md`:
  - blocker admin auth (`user_metadata.role`) removido;
  - suite minima automatizada de pagamentos implementada;
  - drift de schema mitigado com `schema.sql` legado bloqueado;
  - integracao CMS publica ampliada em `SobrePage` e `ContactosPage`.
- Riscos residuais de lancamento:
  - Stripe ainda em modo teste (sem vendas reais);
  - hardening pendente em headers (`CSP`/`HSTS`) e policy publica `admins_read`;
  - fluxo de transferencia ainda mostra dados bancarios placeholder em `CheckoutPage`.
- Parecer atual: **NO-GO** para lancamento final sem fechar os itens acima.

---

## Update - Fecho de blockers finais (2026-04-13)

- `CheckoutPage` e `SucessoPage` deixaram de usar IBAN placeholder e passaram a ler `bank_iban`, `bank_titular`, `bank_mbway` de `config_site` com fallback seguro.
- `vercel.json` recebeu hardening com `Content-Security-Policy` e `Strict-Transport-Security` mantendo compatibilidade com Stripe/Supabase/Google Fonts.
- Criada migration `20260413_admins_read_hardening.sql` para restringir `admins_read` a `USING (is_admin())`.
- Validacao local apos alteracoes:
  - `npm test` -> 15/15
  - `npm run build` -> OK
- Pendencia operacional principal: aplicar migration nova em producao e concluir checklist Stripe live.

---

## Update - Higiene de migrations + CMS Pagamentos (2026-04-13)

- `20260413_schema_additions.sql` removido (era redundante face aos ficheiros individuais criados anteriormente).
- `20260413_vendas_email_estado.sql` actualizado com CHECK constraint idempotente via bloco `DO $$`.
- CMS admin recebeu nova secção **Pagamentos** com campos `bank_iban`, `bank_titular`, `bank_mbway`:
  - `src/lib/siteContent.ts`: defaults + campos adicionados ao `SITE_CONTENT_FIELDS`.
  - `src/features/admin/views/Content/ContentView.tsx`: `SectionId` e `fieldsBySection` actualizados.
  - Admin pode agora definir IBAN/MBWay sem aceder ao Supabase Dashboard.
- `vercel.json`: adicionado `Permissions-Policy` (CSP e HSTS já estavam configurados).
- Lista completa de migrations a aplicar em produção: 5 ficheiros (ver Passo 1 acima).
- `npm run build` -> OK após todas as alterações.

---

## Update - Validacao objetiva de lancamento comercial (2026-04-13)

Confirmacoes explicitas:
- Checkout cartao pronto em codigo para producao: **SIM** (reserva atomica, webhook idempotente, testes criticos a passar).
- Transferencia bancaria com dados reais visiveis: **PARCIAL** (codigo ja le de `config_site`; depende de preencher `bank_iban/bank_titular/bank_mbway` reais em prod).
- Policy `admins_read` deixou de expor dados: **PARCIAL** (migration criada; so fica efetivo apos aplicar em producao).
- CSP/HSTS aplicados sem quebrar app: **SIM em validacao local** (`npm run build` + app funcional); **por confirmar em producao** apos deploy.
- Stripe live preparado corretamente: **PARCIAL** (codigo pronto; falta cutover operacional de chaves/secrets/webhook e compra real de validacao).

Resultado atual:
- Falhas de codigo bloqueantes conhecidas: **nao identificadas** neste escopo final.
- Pendencias restantes: **operacionais de producao**.

---

## Update - Preparacao para carga de obras reais (2026-04-13)

- Admin `Obras` endurecido para onboarding real sem refactor:
  - valida titulo/tecnica/estado;
  - valida ano (1900..ano atual+1);
  - exige preco > 0 para `disponivel`/`reservado`;
  - exige imagem para `disponivel`/`reservado`;
  - mensagens de erro mais claras no submit.
- Slug ficou mais robusto:
  - normalizacao segura (`toSlugBase`);
  - unicidade local com sufixo (`-2`, `-3`, ...);
  - em edicao, preserva `slug` existente para evitar quebrar links ja publicados.
- Upload de imagem de obra endurecido em `src/lib/db.ts`:
  - whitelist mime: `jpeg/png/webp/avif`;
  - limite 8MB;
  - novos uploads organizados em `obras/artworks/<YYYY>/<MM>/...`;
  - `cacheControl` longo para assets estaticos.
- Validacao local apos alteracoes:
  - `npm test` -> 15/15
  - `npm run build` -> OK

