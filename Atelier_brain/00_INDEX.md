# Atelier Ana Alexandre — Índice do Vault

> Última actualização: 2026-04-13
> Repositório: `c:\figma` | Branch: `main`
> Supabase Project ID: `vqunmqtozykwqtmyfjyi`

---

## Documentos Essenciais

| Ficheiro | Conteúdo |
|----------|----------|
| [[01_PROJECT_OVERVIEW]] | Stack, objectivos, domínio, estado geral |
| [[02_ARCHITECTURE]] | Diagrama de sistema, fluxos principais, ficheiros críticos |
| [[03_FRONTEND]] | Páginas, componentes, routing, design system |
| [[04_BACKEND_SUPABASE]] | Tabelas, RLS, Edge Functions, Storage |
| [[05_PAYMENTS_STRIPE]] | Fluxo completo checkout → webhook → stock |
| [[06_SECURITY]] | Riscos, headers, auth, RLS hardening |
| [[07_SEO_PERFORMANCE]] | Meta tags, OG, sitemap, bundle |
| [[08_BUGS_AND_RISKS]] | Bugs confirmados com severidade e localização |
| [[09_ROADMAP]] | Fases de implementação por prioridade |
| [[10_TEST_PLAN]] | Testes manuais do fluxo crítico |
| [[11_DEPLOY_ENV]] | Env vars, domínios, CORS, Vercel/Hostinger |
| [[12_DECISIONS_LOG]] | Decisões técnicas já tomadas e porquê |
| [[13_PROMPTS_LIBRARY]] | Prompts reutilizáveis para tarefas comuns |
| [[14_SESSION_HANDOFF]] | Estado actual + próximo passo recomendado |

---

## Protocolo obrigatório de uso

### Início de sessão
1. Ler [[14_SESSION_HANDOFF]] — contexto actual + próximo passo
2. Consultar notas relevantes para a tarefa antes de tocar no código

### Durante o trabalho
- Se vault divergir do código real → **o código real vence** → actualizar vault
- Não copiar código para o vault — referenciar caminhos reais

### Após CADA tarefa relevante (automático, sem pedir)
1. [[08_BUGS_AND_RISKS]] — marcar ✅ resolvidos; adicionar novos
2. [[09_ROADMAP]] — marcar ✅ tarefas e fases completas
3. [[12_DECISIONS_LOG]] — registar decisões técnicas não óbvias
4. [[14_SESSION_HANDOFF]] — estado, blockers, próximos 3 passos, alertas
5. Declarar explicitamente: quais ficheiros do vault foram actualizados + 1 linha do que mudou

### Regra de ouro
[[12_DECISIONS_LOG]] só cresce — nunca apagar entradas.
