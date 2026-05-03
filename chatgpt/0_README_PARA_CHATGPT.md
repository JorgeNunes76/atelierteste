# Contexto do Projeto para Análise (Atelier Ana Alexandre)

Olá ChatGPT! Este diretório contém os três ficheiros principais de documentação técnica do projeto "Atelier Ana Alexandre", uma SPA e-commerce de arte construída com React 18, Supabase (DB + Auth + Edge Functions) e Stripe.

O desenvolvedor está a partilhar este contexto contigo com dois objetivos:
1. **Melhorar a qualidade do trabalho e as decisões de arquitetura**, identificando falhas de segurança, otimizações de performance, e boas práticas aplicáveis.
2. **Produzir melhores prompts**, tendo um contexto estruturado do projeto para que possas ajudar com geração de código, testes, refactoring, e implementações futuras de forma alinhada com as restrições estritas já defenidas (Edge Functions, RLS, auth metadata, Stripe).

## O que está nos ficheiros:

- **1_CLAUDE_prompt_context.md** (`CLAUDE.md` original do repo): O "system prompt" principal e a arquitetura basilar atualizada do projeto. Contém as regras sagradas (acesso a dados, segurança e arquitetura geral).
- **2_PROJECT_STATE.md**: Um snapshot compreensivo da arquitetura em produção, fluxos críticos (checkout com reserva e pagamento, formulários CMS públicos), falhas conhecidas, segurança, mitigação de vulnerabilidades (especialmente relativas ao Authz e concorrência).
- **3_LATEST_SESSION.md**: O que foi abordado na iteração/sessão mais recente, os blockers encerrados, mitigação de bugs e os próximos passos a seguir.

**Por onde deves analisar?**
Podes começar por analisar o `2_PROJECT_STATE.md` para entender as falhas conhecidas e as vulnerabilidades potencias (especialmente o facto do `user_metadata` ditar privilégios de Admin erradamente no frontend).
Gera comentários críticos sobre melhorias e recomenda as tuas indicações para a próxima interação e sessão do desenvolvedor.
