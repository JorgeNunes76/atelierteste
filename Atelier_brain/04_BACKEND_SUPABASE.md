# 04 — Backend / Supabase

## Tabelas (fonte de verdade: `src/lib/database.types.ts`)

### `obras`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| titulo | text NOT NULL | |
| tecnica | text NOT NULL | |
| dimensoes | text | |
| ano | integer | |
| preco | numeric(10,2) | nullable |
| estado | text | `disponivel` / `reservado` / `vendido` + CHECK |
| descricao | text | |
| imagem_url | text | URL pública do bucket Supabase |
| slug | text UNIQUE | para URLs amigáveis |
| destaque | boolean DEFAULT false | obras na homepage |
| ordem | integer DEFAULT 0 | ordenação manual |

### `vendas`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| cliente_nome | text NOT NULL | |
| cliente_email | text NOT NULL | |
| cliente_tel | text | |
| total | numeric NOT NULL | calculado server-side |
| items | jsonb NOT NULL | `[{id, titulo, preco}]` |
| morada | text | concatenada com NIF e notas |
| estado | text | `pendente`/`pago`/`enviado`/`cancelado` |
| stripe_session_id | text | NULL até webhook completed ⚠️ |
| metodo_pagamento | text | `card` / `transferencia` |
| referencia | text | referência de transferência (nunca preenchida ⚠️) |

### `contactos`
| Coluna | Tipo |
|--------|------|
| id, created_at, nome, email, telefone, assunto, mensagem | |
| lido | boolean DEFAULT false |

### `newsletter`
| Coluna | Tipo |
|--------|------|
| id, email UNIQUE, ativo boolean |

### `config_site`
| Coluna | Tipo | Notas |
|--------|------|-------|
| chave | text UNIQUE | ex: `hero_titulo`, `mentoria_preco_individual` |
| valor | text | editável pelo admin via painel |

**Seeds actuais:** mentoria_preco_individual (120), mentoria_preco_grupo (60), mentoria_preco_online (80), email_contacto, galeria_titulo, hero_titulo, hero_subtitulo, sobre_titulo, sobre_texto, mentoria_titulo, mentoria_desc

**Em falta (por adicionar):** `bank_iban`, `bank_titular`, `bank_mbway`

### `admins`
| Coluna | Tipo |
|--------|------|
| email PK | text |
| created_at | timestamptz |

Seed: `atelier.anaalexandre@gmail.com`

## RLS — resumo de políticas

| Tabela | Leitura pública | Escrita pública | Admin |
|--------|-----------------|-----------------|-------|
| obras | ✅ todas | ❌ | ✅ all via is_admin() |
| contactos | ❌ | ✅ insert (sem check) | ✅ all |
| newsletter | ❌ | ✅ insert | ✅ all |
| config_site | ✅ todas | ❌ | ✅ all |
| vendas | por email JWT | ✅ insert | ✅ all |
| admins | ✅ todas ⚠️ | ❌ | — |

⚠️ `admins` tem policy de leitura pública — expõe email do admin. Ver [[06_SECURITY]].

## Função `is_admin()` SQL

```sql
-- SECURITY DEFINER — corre com permissões elevadas
SELECT true FROM public.admins WHERE email = auth.jwt() ->> 'email'
```
Usada em todas as RLS policies de escrita/admin. Funciona se email JWT estiver disponível (requer verify email activado).

## Storage

- **Bucket:** `obras` (público para leitura)
- **Estrutura:** raiz do bucket para imagens de obras; subpasta `site/` para imagens de configuração
- **Upload:** `src/lib/db.ts` → `uploadObraImage()` e `uploadSiteImage()`
- **Filename:** `{timestamp}-{random}.{ext}` — sem validação de tipo/tamanho ⚠️

## Edge Functions

### `create-checkout-session`
- **Trigger:** POST do browser (via `src/lib/stripe.ts`)
- **Payload esperado:** `{ itemIds: string[], customerEmail, customerName, customerTelefone?, customerMorada? }`
- ⚠️ Frontend envia `items` em vez de `itemIds` — QUEBRADO. Ver [[08_BUGS_AND_RISKS]] F1.
- **CORS:** `atelieranaalexandre.pt`, `localhost:5173`, `localhost:4173`
- **Secrets:** `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`

### `stripe-webhook`
- **Trigger:** POST do Stripe (sem CORS — endpoint server-to-server)
- **Eventos tratados:** `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
- **Signature verification:** `stripe.webhooks.constructEvent()` ✅
- ⚠️ Não idempotente no envio de email. Ver [[08_BUGS_AND_RISKS]] F5.
- **Secrets:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`

### `create-transfer-order`
- **Trigger:** POST do browser (via `src/lib/email.ts`)
- **Payload público esperado:** `{ itemIds, customerEmail, customerName, customerTelefone?, customerMorada?, nif?, notas?, metodo_pagamento? }`
- **Validação:** rejeita campos internos (`total`, `estado`, `items`, `stripe_session_id`, `referencia`, etc.)
- **Whitelist:** `metodo_pagamento` só pode ser `transferencia`
- **Preço/itens:** recalculados server-side a partir de `obras`
- **Estado inicial:** sempre `pendente`
- **CORS:** `atelieranaalexandre.pt`, `localhost:5173`, `localhost:4173`
- **Secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `IBAN_ATELIER`

### `notify-contacto`
- **Trigger:** DB Webhook (configuração manual no Supabase Dashboard)
- **Acção:** envia email ao atelier em novo contacto
- ⚠️ Trigger DB não configurável via ficheiro — setup manual obrigatório

## `src/lib/db.ts` — funções exportadas

```
getObras()                    → Obra[]          (silently returns [] on error ⚠️)
getObraById(id)               → Obra | null
getObraBySlug(slug)           → Obra | null
getObrasDestaque()            → Obra[]          (silently returns [] on error ⚠️)
enviarContacto(contacto)      → void            (throws on error)
subscribeNewsletter(email)    → "ok" | "already_subscribed"
getConfig(chave)              → string | null
createObra(obra)              → Obra            (throws on error)
updateObra(id, updates)       → void
deleteObra(id)                → void
getContactosAdmin()           → Contacto[]
marcarContactoLido(id)        → void
deleteContacto(id)            → void
getNewsletterAdmin()          → NewsletterRow[]
toggleNewsletterStatus(id, ativo) → void
createVenda(venda)            → string | null   (id da venda)
updateObraStatus(id, estado)  → void
getConfigAll()                → ConfigRow[]
updateConfigAdmin(chave, valor) → void
getVendasAdmin()              → VendaRow[]
updateVendaEstado(id, estado) → void
getStatsAdmin()               → { totalObras, mensagensNaoLidas, totalNewsletter, vendasTotal }
uploadObraImage(file)         → string          (URL pública)
deleteObraImage(imageUrl)     → void
uploadSiteImage(file, chave)  → string          (URL pública)
```

## schema.sql vs BD real — DISCREPÂNCIA

`supabase/schema.sql` está desactualizado:
- Tem `stripe_id` → BD real tem `stripe_session_id`
- Não tem `metodo_pagamento` nem `referencia`
- **Não usar schema.sql para recriar a BD** — usar `database.types.ts` como referência
| email_estado | text | recibo Stripe: `pendente` / `enviando` / `enviado` / `retry_needed` |
