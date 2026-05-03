# 13 — Biblioteca de Prompts Reutilizáveis

> Prompts optimizados para tarefas recorrentes neste projecto.
> Copiar e adaptar conforme necessário. Guardar novos prompts aqui após iterações bem-sucedidas.

---

## AUDIT — Auditoria de um fluxo específico

```
Faz uma auditoria focada no fluxo de [NOME DO FLUXO] deste projecto.

Contexto:
- Vite + React SPA, Supabase (PostgreSQL + Edge Functions Deno), Stripe, Resend.
- Regra: acesso à BD sempre via src/lib/db.ts. Auth via src/lib/auth.ts.
- Ficheiros críticos: [listar os relevantes para o fluxo].

Analisa:
1. Bugs concretos ligados ao código real (ficheiro + linha).
2. Riscos de segurança ou integridade de dados.
3. Dependências entre correções.

Regras:
- Não implementes nada.
- Liga cada problema ao ficheiro e linha real.
- Marca como "provável" se não tiveres prova directa.
```

---

## IMPLEMENT — Implementar uma fase do roadmap

```
Implementa a [FASE X] do roadmap do projecto Atelier Ana Alexandre.

Contexto do projecto:
- Vite + React SPA + TypeScript + Supabase + Stripe
- Regra: nunca chamar supabase.from() directamente em componentes — usar src/lib/db.ts
- Animações: importar de motion/react (nunca framer-motion)
- Design tokens: src/lib/tokens.ts

Fase a implementar: [descrever o que foi planeado no 09_ROADMAP]

Estratégia: [explicar a abordagem em 2-3 linhas]

Regras:
- Não refactores cosméticos.
- Não renomear sem necessidade forte.
- Migrations SQL devem ser explícitas e reversíveis.
- Mostrar: ficheiros alterados, porquê, risco de regressão, como testar.
```

---

## SQL MIGRATION — Criar migration segura

```
Cria uma migration SQL para [NOME DA ALTERAÇÃO] na BD Supabase deste projecto.

Contexto da tabela: [descrever estrutura actual da tabela]
O que preciso de alterar: [descrever a mudança]

Requisitos:
- Idempotente (pode correr múltiplas vezes sem erros)
- Reversível (incluir bloco -- down)
- Compatível com PostgreSQL (Supabase)
- Não quebrar RLS existentes
- Incluir índice se a coluna for usada em WHERE frequentes
```

---

## EDGE FUNCTION — Corrigir ou criar Edge Function

```
[Corrige / Cria] a Supabase Edge Function [NOME] para [OBJECTIVO].

Contexto:
- Runtime: Deno (não Node.js)
- Imports: usar esm.sh para Stripe e @supabase/supabase-js
- CORS: whitelist em ALLOWED_ORIGINS (ver padrão das outras Edge Fns)
- Secrets via Deno.env.get("SECRET_NAME")
- Service role key para bypass RLS

Problema actual: [descrever o bug ou lacuna]
Fix necessário: [descrever a solução]

Regras:
- Manter estrutura de resposta JSON existente
- Não alterar lógica não relacionada
- Incluir tratamento de erro com status codes correctos
```

---

## BUG FIX — Corrigir bug específico

```
Corrige o bug [F1/F2/...] documentado em [[08_BUGS_AND_RISKS]].

Bug: [descrição da falha]
Ficheiro(s): [paths]
Causa raiz: [explicação do porquê acontece]

Contexto do projecto:
- Supabase Edge Function (Deno) para backend
- React SPA para frontend
- Regra: sem chamadas directas a supabase.from() em componentes

Fix esperado:
- [descrição da solução]

Após corrigir, mostra:
1. Ficheiros alterados
2. Porquê da mudança
3. Risco de regressão
4. Como testar
```

---

## REVIEW — Revisão de código antes de commit

```
Faz code review das alterações feitas nesta sessão para o projecto Atelier Ana Alexandre.

Critérios:
1. Sem chamadas directas a supabase.from() em componentes
2. Sem imports de framer-motion (usar motion/react)
3. Sem cores hardcoded (usar tokens.ts)
4. Edge Functions com CORS correcto e tratamento de erro
5. Sem secrets expostos em código cliente
6. SQL migrations idempotentes e reversíveis
7. Sem regressões nos fluxos de checkout documentados em [[10_TEST_PLAN]]

Ficheiros alterados: [listar]
```

---

## SESSION START — Arrancar uma sessão nova

```
Estou a trabalhar no projecto Atelier Ana Alexandre (loja de arte online).
Stack: Vite + React 18 + TypeScript + Supabase + Stripe + Vercel.
Repositório: c:\figma

Lê os seguintes documentos de contexto antes de responder:
- [[14_SESSION_HANDOFF]] — estado actual e próximo passo
- [[08_BUGS_AND_RISKS]] — bugs activos
- [[09_ROADMAP]] — fases de implementação

Tarefa desta sessão: [descrever o que queres fazer]
```

---

## VAULT UPDATE — Actualizar vault após sessão

```
Actualiza o vault Atelier_brain após as alterações desta sessão.

O que foi feito: [resumo das alterações]
Ficheiros modificados: [lista]
Bugs resolvidos: [lista de Fx]
Novos bugs descobertos: [lista se houver]

Tarefas:
1. Marcar bugs resolvidos como ✅ em [[08_BUGS_AND_RISKS]]
2. Marcar tarefas completas em [[09_ROADMAP]]
3. Actualizar [[14_SESSION_HANDOFF]] com próximo passo
4. Adicionar decisões tomadas a [[12_DECISIONS_LOG]] se relevante
```
