# Auditoria de Progresso: Atelier Ana Alexandre

Data da Auditoria: 13 de Abril de 2026

## Classificação dos Requisitos

### 🟢 Concluído
- **Pagamentos**: Fluxo desenhado com Stripe (cartão de crédito) e alternativo via Transferência Bancária/MBWay, com cálculo e mitigação de erros (ex: NaN na UI).
- **Checkout**: Form multistep de alta conversão. Recolha flexível com auto-fill de sessão.
- **Webhooks**: Função Edge (`stripe-webhook`) totalmente robusta, lidando com idempotência, libertação de reservas, e disparo de faturas com fallback de Retry pelo `Resend`.
- **Segurança**: Row Level Security (RLS) completa em todo o Schema do Supabase, incluindo Storage (Bucket Obras). Regras estritas por Auth JWT (`is_admin()`) e cabeçalhos de segurança bloqueantes no Vercel (`vercel.json`).
- **Validação Backend**: Confia nos Data Types, Constraints (ex: check state `disponivel`, `reservado`) nativas do Postgres. Segurança anti-tamper.
- **Dashboard/Admin**: UI protegida e altamente detalhada, com separadores para todas as entidades críticas.
- **Gestão de Obras**: CRUD totalmente modelado, do upload da fotografia ao controlo da tag "Destaque" via UI e state do Supabase.
- **Observabilidade**: Sistema in-house desenvolvido! Em vez de usar Sentry/LogRocket cego, captura logs no browser e injeta numa base de dados dedicada (`report-client-error`), evitando quebra de UX no caso de falhas e alertando anomalias.
- **Deploy**: Estrutura sólida usando Vercel com um `vercel.json` bem afinado (mimetizando redirects para Bots e permitindo crawler dinâmico).

### 🟡 Parcialmente Concluído
- **Gestão de Conteúdo (CMS)**: O painel já tem a tabela de `config_site` onde se configuram textos rápidos. Falta avaliar se todas as páginas de "História/Contacto" foram interligadas com a Base de Dados ou se ainda se mantêm hardcoded (ex. i18n estático) para além da Homepage.
- **Performance**: O site tira partido do build do Vite, mas o pipeline de Imagens na galeria usa o raw string url do Supabase Storage. O ideal aqui seria usar *Supabase Image Transformations* ou otimizador local (embora exista `Cache-Control` max-age configurado no vercel.json para estáticos).
- **SEO**: Existem sitemaps assíncronos gerados na API do Vercel e o hook `useSEO` gere metas. Está perto do cimo, mas ficaria 100% com injecção estática de *Structured Data (Schema.org)* na View de cada Obra e Breadcrumbs.

### 🔴 Não Iniciado
- **QA**: Não existem blocos de testes configurados no projeto (Zero evidências de bibliotecas de teste como Jest, Vitest, Playwright ou Cypress no `package.json`). Tudo o que foi testado foi verificado visualmente e manualmente.

### ❓ Por Confirmar
- **Consentimento/RGPD**: A página Checkout tem termos em checkbox? Verificação final para ficar *lawproof*.

---

## Síntese para a Próxima Fase

### 1. Lista de melhorias concluídas
- ✅ O fluxo de compras é resiliente.
- ✅ O webhook lida muito bem com estados pendentes, expirados e bloqueados de obras (`reserved_until`).
- ✅ Funções de envio de mail por Rest API implementadas e asseguradas.
- ✅ Área reservada (Admin) super madura (gestão e views muito refinadas com controlos de tabelas complexos).

### 2. Lista do que está parcial
- ⚠️ Conteúdo e Gestos textuais fora das "obras" (necessita da uniformização a 100% de `config_site` caso a artista pretenda tudo editável).
- ⚠️ SEO Metadata profunda (rich-snippets e schema markup de *Product*)
- ⚠️ Gestão dimensionada de Thumbnails nas obras, diminuindo drásticamente os KBs na `GaleriaPage`.

### 3. Lista do que falta
- ❌ Scripts de Teste (Unitários para o Cart, End-to-End para o Checkout-to-Webhook).
- ❌ Setup legal visível no checkout (aceite explícito).

### 4. Blockers de lançamento
O código atual é de facto **Production-Ready** em termos de arquitetura e infraestrutura de vendas. Não há bloqueadores críticos impeditivos de lançar amanhã se:
1. As chaves de Stripe Production e Resend Production estiverem carregadas corretamente no Vercel (Production) & Supabase.
2. Não houver impedimentos legais pendentes (Termos e Condições estarem alinhados).

### 5. Próximos Passos (Por Ordem de Prioridade)
1. **Sanity Check e QA Manual Extensivo**: Fazer 2 ou 3 compras *end-to-end* com cartão (Stripe teste) e gerar erro forçado, verificando logs no Supabase Edge function de Client e Stripe-Webhook para garantir fiabilidade. 
2. **RGPD Checkout**: Confirmar checkboxes de consentimento RGPD antes de ativar produção.
3. **SEO Rich-Snippets**: Adicionar os dados `application/ld+json` do objeto da obra ao `ObraPage.tsx` para o Google a categorizar como Produto Artístico com Preço.
4. **Implementar Tooling de Testes Unitários Base:** Instalar Vitest, para cobrir `cart.tsx` (lógica de deduplicação e adições) e utilitários de backend para prevenir futuras quebras.
5. **Configurar Analytics**: Instalar Plausible Analytics (privacy-friendly) ou Google Tag Manager.
6. **Lançamento (Go Live)**.

### 6. Atualização do Vault
- Foi feito e confirmado este relatório do Progresso (*Snapshot* da Base de Código de React/Vite/Supabase). Todas as integrações com OpenSquad de análise futura a este produto devem partir dos 4 grupos identificados acima.
