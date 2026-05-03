# Relatório Melhorado — Atelier Ana Alexandre

> Afonso Nunes, Duarte Ribeiro e Guilherme Ventura  
> UC de Web Marketing e Comércio Eletrónico  
> Licenciatura em Ciência de Dados para a Gestão  
> Orientador: Prof. Dr. Rui Cardoso  
> Coimbra, 24 de março de 2026

---

## Resumo

O presente relatório descreve o desenvolvimento do projeto Atelier Ana Alexandre, uma plataforma de comércio eletrónico concebida especificamente para a artista plástica Ana Alexandre. O projeto responde à necessidade de dotar a artista de um espaço digital autónomo que funcione, em simultâneo, como portfólio interativo, galeria de venda de obras originais e plataforma de divulgação das suas aulas de pintura e sessões de mentoria.

A solução desenvolvida integra um website com design em modo escuro, suporte multilingue em quatro idiomas (Português, Inglês, Espanhol e Francês), um sistema de carrinho de compras baseado em LocalStorage e um processo de checkout seguro com integração da API do Stripe. Do ponto de vista técnico, a plataforma evoluiu de uma primeira versão em HTML5/CSS/JS com backend em PHP para uma arquitetura moderna assente em Next.js 16 (App Router) com TypeScript, Tailwind CSS 4, Supabase (base de dados, autenticação e armazenamento) e Stripe para processamento de pagamentos. A aplicação inclui ainda componentes 3D interativos via React Three Fiber, animações com Framer Motion e um sistema de internacionalização nativo com quatro idiomas.

**Palavras-chave:** Web Marketing e Comércio Eletrónico, Arte Digital, Galeria Online, Stripe, Marketing Digital, Portfólio, E-commerce, SEO, Multilingue, Aulas de Pintura

---

## Capítulo 1 — Introdução

### 1.1 Contextualização

O sector das artes visuais enfrenta, no contexto digital contemporâneo, um duplo desafio: a necessidade de afirmar identidade e autoria num ambiente saturado de conteúdos e a urgência de criar canais de comercialização autónomos que dispensem a intermediação das galerias tradicionais. A digitalização dos processos comerciais e a crescente adoção de plataformas de comércio eletrónico abriram uma oportunidade significativa para que os artistas estabeleçam uma presença direta junto dos seus colecionadores e alunos.

O mercado de arte em Portugal tem assistido a uma crescente digitalização, impulsionada pela democratização do acesso à Internet e pela proliferação de plataformas de e-commerce globais. No entanto, o segmento de arte original de autor permanece sub-representado em soluções digitais dedicadas. A maioria dos artistas plásticos portugueses recorre a plataformas generalistas — redes sociais ou marketplaces internacionais como a Etsy ou a Saatchi Art — que, apesar de garantirem visibilidade, não proporcionam autonomia editorial, controlo sobre a experiência do utilizador, nem a capacidade de integrar modelos de ensino e mentoria.

Paralelamente, verifica-se um crescimento expressivo do mercado de formação artística online, potenciado pela pandemia de COVID-19 e pela normalização do consumo de conteúdos educativos em formato digital. Este fenómeno representa uma oportunidade concreta para artistas com experiência pedagógica.

Ana Alexandre é artista plástica com doutoramento em Práticas Artísticas e ministra aulas presenciais de pintura no seu atelier em Tomar. A sua obra tem sido exibida extensivamente em Portugal — em Tomar, Porto, Coimbra, Lisboa, Figueira da Foz, Espinho, Viana do Castelo — e internacionalmente, em cidades como Berlim, Londres, Paris, Moscovo, São Petersburgo, Volgogrado, Spoleto, Corunha e várias cidades do Brasil. Em 2014, foi galardoada com a Medalha de Criatividade na exposição "Peixeira da Figueira da Foz". A transição para o digital exigia uma solução tecnológica robusta, esteticamente coerente com a identidade da marca e suficientemente flexível para suportar a evolução futura do negócio.

É neste contexto que surge o projeto Atelier Ana Alexandre: uma plataforma web desenvolvida de raiz, que responde à lacuna identificada no mercado nacional — a ausência de soluções digitais especializadas que permitam a artistas plásticos independentes comercializar obras e serviços formativos de forma direta, estruturada e visualmente à altura do valor das suas criações.

A plataforma pode ser consultada no domínio oficial: [atelieranalexandre.com](https://atelieranalexandre.com)  
O repositório do código-fonte está disponível em: [github.com/AfonsoNunes03/Atelier](https://github.com/AfonsoNunes03/Atelier)  
O documento no Prism pode ser consultado em: Documento no Prism  
A aplicação no Glide está disponível em: [Aplicação no Glide](https://go.glideapps.com/app/KukuwCUQc9rKD79lnWhe/layout)

**Redes sociais:**
- [Facebook](https://www.facebook.com/profile.php?id=100063675053556)
- [Instagram](https://www.instagram.com/atelier.anaalexandre/)
- [Pinterest](https://pt.pinterest.com/aanaalexandre/)

### 1.2 Descrição do Trabalho

A plataforma integra quatro componentes funcionais principais:

- **Galeria Digital:** Portfólio organizado com 21 obras da artista (de 2003 a 2024), com páginas de detalhe individuais por peça, ficha técnica completa (técnica, dimensões, ano, série) e integração direta com o sistema de compra. As obras estão organizadas em três categorias: Acervo & Obras Capitais, Séries de Investigação e Gabinete de Desenho.

- **Loja Online:** Sistema de e-commerce com carrinho de compras, checkout seguro via Stripe e gestão de encomendas. As obras com preço definido — como *Dança Geométrica* (800 EUR) e *Fragmento Solar* (600 EUR) — podem ser adquiridas diretamente; as restantes são apresentadas como "Sob Consulta".

- **Academia / Mentoria:** Secção dedicada à divulgação das aulas de pintura presenciais no atelier de Tomar e à preparação do lançamento futuro de formatos online.

- **Internacionalização:** Motor de tradução nativo com suporte para Português, Inglês, Espanhol e Francês, com o objetivo de alcançar o mercado europeu de colecionismo.

### 1.3 Objetivos

O objetivo principal deste projeto é desenvolver uma plataforma digital que permita à artista Ana Alexandre comercializar as suas obras e serviços de forma autónoma e direta, com uma experiência de utilizador de elevada qualidade.

De forma mais específica, os objetivos definidos incluem:

- Desenvolver um website com design imersivo, centrado na valorização visual da obra artística;
- Implementar um sistema de galeria online com fichas técnicas detalhadas por obra;
- Integrar um sistema de e-commerce funcional com carrinho de compras e checkout seguro via Stripe;
- Criar uma secção de Mentoria que suporte a inscrição em aulas presenciais e prepare o lançamento de formatos online;
- Implementar um motor de internacionalização nativo (i18n) com suporte para quatro idiomas;
- Garantir otimização SEO com metadados estruturados e Open Graph para partilha em redes sociais;
- Assegurar a responsividade e acessibilidade da plataforma em diferentes dispositivos;
- Validar o funcionamento do fluxo de compra completo através de testes end-to-end.

Para além dos objetivos técnicos, o projeto pretende contribuir para a autonomia comercial e digital da artista, eliminando a dependência de intermediários e conferindo-lhe controlo total sobre a apresentação e comercialização do seu trabalho.

### 1.4 Organização do Relatório

O presente relatório está organizado em oito capítulos. O Capítulo 1 apresenta a introdução, contextualizando o projeto e definindo os seus objetivos. O Capítulo 2 aborda o modelo de negócio, incluindo a proposta de valor e a análise SWOT. O Capítulo 3 detalha o planeamento técnico, com a definição de requisitos, arquitetura e cronograma. O Capítulo 4 documenta o desenvolvimento da solução, descrevendo o website, a aplicação móvel e as estratégias de SEO. O Capítulo 5 descreve as estratégias de marketing digital adotadas. O Capítulo 6 apresenta os resultados obtidos e a análise de performance. O Capítulo 7 contém a discussão crítica, com a comparação entre resultados esperados e obtidos. O Capítulo 8 apresenta as conclusões e o trabalho futuro.

---

## Capítulo 2 — Modelo de Negócio

### 2.1 Proposta de valor e diferenciação

A proposta de valor do Atelier Ana Alexandre assenta no desenvolvimento de uma plataforma digital que serve como extensão natural do atelier físico da artista, criando uma ponte entre a criação artística e o mercado global de colecionismo e formação.

A principal diferenciação reside na exclusividade da solução: ao contrário das plataformas generalistas de venda de arte, este website foi concebido de raiz para a identidade e a obra específicas de Ana Alexandre. Cada decisão de design — desde a paleta cromática (fundo preto/cinza escuro com destaques em dourado `#D4AF37`) à tipografia (Inter para o corpo do texto, Playfair Display para títulos) — foi tomada com o objetivo de valorizar e contextualizar o trabalho da artista, criando uma experiência que respeita a linguagem visual das suas pinturas.

A integração de três funções distintas — galeria, loja e mentoria — num único ambiente digital elimina a fragmentação da presença online. O suporte multilingue desde o lançamento posiciona a plataforma para o mercado europeu, alargando significativamente o potencial de audiência.

### 2.2 Segmentação do público-alvo

O público-alvo do Atelier Ana Alexandre organiza-se em dois segmentos principais, correspondentes aos dois eixos de negócio da plataforma.

No **segmento comercial** (galeria e loja):
- Colecionadores de arte — particulares com interesse em obras originais de autores portugueses contemporâneos;
- Curadores e galerias — profissionais do sector artístico;
- Amantes de arte — público geral com sensibilidade estética.

No **segmento formativo** (academia e mentoria):
- Aprendizes de pintura — adultos que procuram aprender a pintar no atelier em Tomar;
- Artistas em desenvolvimento — criadores que procuram mentoria especializada;
- Futuros alunos online — público nacional e internacional interessado em formação digital.

### 2.3 Modelos de receita

A plataforma suporta três modelos de receita, com diferentes horizontes temporais:

1. **Venda direta de obras originais:** Comercialização direta através da loja integrada, com processamento via Stripe, eliminando as comissões de intermediários.

2. **Formação presencial:** Canal de divulgação e captação de alunos para as aulas no atelier físico de Tomar, com inscrição e pagamento geridos pelo website.

3. **Formação online (desenvolvimento futuro):** A arquitetura prevê a integração futura de módulos de formação online — aulas gravadas, workshops ao vivo e sessões de mentoria por videochamada.

### 2.4 Análise SWOT

A análise SWOT identifica os fatores internos e externos que podem influenciar o desenvolvimento e o sucesso do projeto Atelier Ana Alexandre.

| | **FORÇAS (Interno)** | **FRAQUEZAS (Interno)** |
|---|---|---|
| | Plataforma própria com design desenvolvido de raiz | Ausência de histórico de vendas online |
| | Galeria, loja e mentoria integradas numa só solução | Notoriedade digital da marca em fase inicial |
| | Suporte multilingue nativo (mercado europeu) | Dependência crítica de tráfego orgânico |
| | Checkout Stripe sem fricção | Necessidade de suporte técnico contínuo |
| | Artista com formação académica sólida e currículo internacional | Portfólio digital ainda incompleto |

| | **OPORTUNIDADES (Externo)** | **AMEAÇAS (Externo)** |
|---|---|---|
| | Crescimento do mercado de arte digital | Concorrência de plataformas como a Etsy |
| | Expansão da formação artística online | Dependência de plataformas de terceiros |
| | Internacionalização via mercado europeu | Mudanças nos padrões de consumo cultural online |
| | Valorização da arte portuguesa no exterior | Sazonalidade nas vendas de arte |
| | Parcerias com museus e galerias físicas | Custos elevados de publicidade paga (CPC) |

---

## Capítulo 3 — Planeamento do Projeto

### 3.1 Definição de requisitos e funcionalidades

Os requisitos funcionais foram definidos em colaboração com a artista:

- **Galeria de obras:** Apresentação organizada com fichas técnicas completas (título, técnica, dimensões, ano, série e descrição) e sistema de filtros avançados;
- **Loja online:** Carrinho de compras, gestão de stock e checkout via Stripe;
- **Secção de mentoria:** Apresentação das aulas e formulário de contacto/inscrição;
- **Página de contactos:** Formulário seguro com proteção anti-spam e botão flutuante WhatsApp;
- **Motor de tradução:** Alternância imediata entre PT, EN, ES e FR;
- **Responsividade:** Adaptação a desktop, tablet e dispositivos móveis;
- **SEO base:** Metadados estruturados, Open Graph e schema.org;
- **Painel de administração:** Gestão de obras, encomendas e conteúdos;
- **Autenticação:** Sistema de registo e início de sessão de utilizadores via Supabase Auth.

### 3.2 Arquitetura da solução

A arquitetura foi definida com base em três princípios: leveza, modularidade e autonomia.

A versão inicial (V1) utilizou uma stack leve, sem frameworks pesados (HTML5, Vanilla JS, CSS e PHP 8.0+). A versão atual (V2) evoluiu para uma arquitetura moderna, organizada da seguinte forma:

```
src/
+-- app/                        (Paginas com App Router)
|   +-- page.tsx                (Homepage - A Montra)
|   +-- galeria/                (Galeria e vendas)
|   +-- sobre/                  (Storytelling da artista)
|   +-- mentoria/               (Workshops e aulas)
|   +-- contactos/              (Formulario de contacto)
|   +-- admin/                  (Painel de administracao)
|   +-- login/                  (Autenticacao)
|   +-- register/               (Registo)
|   +-- checkout-sucesso/       (Confirmacao de compra)
|   +-- checkout-cancelado/     (Cancelamento de compra)
|   +-- premio/                 (Premios da artista)
|   +-- privacidade/            (Politica de privacidade)
|   +-- termos/                 (Termos e condicoes)
|   +-- api/
|       +-- stripe/             (Webhooks Stripe)
|       +-- sheets/             (Sincronizacao com Google Sheets)
+-- components/
|   +-- ArtworkFilters.tsx      (Filtros avancados da galeria)
|   +-- ExposicoesMap.tsx       (Mapa interativo de exposicoes)
|   +-- Hero3D.tsx              (Componente 3D da homepage)
|   +-- HeroLivingCanvas.tsx    (Canvas animado)
|   +-- SiteLayout.tsx          (Layout principal)
|   +-- ImageWithFallback       (Imagens com fallback)
+-- lib/
|   +-- supabase/               (Clientes Supabase: browser e server)
|   +-- stripe.ts               (Configuracao Stripe)
+-- i18n/                       (Sistema de internacionalizacao)
+-- middleware.ts               (Middleware de autenticacao e i18n)
```

### 3.3 Tecnologias utilizadas

A stack tecnológica da plataforma foi selecionada com base em critérios de maturidade, desempenho e adequação às necessidades do projeto. As principais tecnologias utilizadas são:

- **Next.js 16 (App Router):** Framework principal para renderização no servidor (SSR) e geração estática (SSG), com otimização automática de performance e SEO;
- **TypeScript:** Tipagem estática que previne erros em tempo de execução e melhora a manutenção do código;
- **Tailwind CSS 4:** Sistema de estilos utilitário que garante consistência visual e desenvolvimento ágil;
- **Supabase:** Plataforma de backend open-source que disponibiliza base de dados PostgreSQL, autenticação e armazenamento de ficheiros;
- **Stripe:** Processamento de pagamentos online, com suporte a checkout seguro e webhooks para gestão de encomendas;
- **React Three Fiber / Three.js:** Renderização de componentes 3D interativos no browser, utilizados na homepage;
- **Framer Motion:** Biblioteca de animações para transições fluidas entre páginas e interações;
- **i18n nativo:** Sistema de internacionalização com suporte para quatro idiomas, integrado no middleware do Next.js;
- **Vercel:** Plataforma de alojamento com CDN global, deploy automatizado e Analytics integrado;
- **Glide:** Plataforma de no-code para desenvolvimento da aplicação móvel complementar.

Esta combinação de tecnologias permite uma elevada disponibilidade, escalabilidade e reduzidos custos operacionais, adaptando-se ao crescimento esperado do catálogo e do volume de transações.

### 3.4 Cronograma e etapas de desenvolvimento

O desenvolvimento foi estruturado em quatro fases sequenciais:

| Fase | Descrição | Estado |
|------|-----------|--------|
| **Fase 1** | Arquitetura base, design system e galeria | Concluída |
| **Fase 2** | Sistema de e-commerce e integração Stripe | Em curso |
| **Fase 3** | Mentoria, formulários e internacionalização | Concluída |
| **Fase 4** | Testes, auditoria e lançamento em produção | Pendente |

### 3.5 Gestão de riscos

Foram identificados cinco riscos principais, cada um com uma estratégia de mitigação definida:

- **Risco técnico (Stripe):** Dependência de chaves de API externas, mitigada com gestão segura de variáveis de ambiente (`.env.local`), validação server-side e páginas dedicadas de sucesso e cancelamento de checkout;
- **Risco de alcance:** Ausência de base de audiência digital, mitigada com estratégia de SEO, Open Graph, metadados estruturados e presença ativa em redes sociais;
- **Risco de sazonalidade:** Flutuações na procura de arte, mitigadas com a diversificação dos modelos de receita (venda direta, formação presencial e formação online futura);
- **Risco de manutenção:** Mitigado com documentação técnica detalhada, arquitetura modular em Next.js e deploy automatizado via Vercel;
- **Risco de performance:** Mitigado com SSR/SSG do Next.js, otimização de imagens, CDN global e lazy loading dos componentes 3D.

---

## Capítulo 4 — Desenvolvimento da Solução

### 4.1 Website

#### Design System

O sistema de design assenta em três pilares:

- **Paleta cromática:** Fundo preto/cinza escuro como base, com destaques em dourado (`#D4AF37` e `#C4956A`) para elementos de destaque, navegação e CTAs. Esta escolha sublinha o posicionamento premium da plataforma e cria um contraste elegante que valoriza as cores vibrantes das obras;
- **Tipografia:** Combinação de Inter (sans-serif, corpo do texto) para legibilidade e Playfair Display (serif, títulos) para sofisticação. Os elementos de navegação utilizam maiúsculas com letter-spacing expandido (`tracking-0.18em`);
- **Layout:** Grelha responsiva com breakpoints para desktop, tablet e mobile. A homepage inclui uma hero section com um componente 3D interativo (React Three Fiber / Three.js) que anima geometrias abstratas, evocando o universo artístico de Ana Alexandre.

#### Páginas implementadas

A plataforma conta com dez páginas principais:

1. **Homepage ("A Montra"):** Hero 3D animado com canvas interativo, apresentação de obras em destaque e descrição do conceito do atelier. O componente `Hero3D.tsx` (13 KB) renderiza uma cena tridimensional com geometrias que respondem ao movimento do rato;
2. **Galeria:** Sistema completo com filtros avançados (`ArtworkFilters.tsx`, 28 KB) — filtragem por categoria (Acervo, Séries, Gabinete de Desenho), técnica, série, faixa de preço e ano. Layout masonry responsivo. 21 obras catalogadas com fichas técnicas completas;
3. **Sobre:** Página de storytelling com fotografia profissional a preto e branco da artista, biografia estruturada em capítulos e mapa interativo de exposições (`ExposicoesMap.tsx`, 83 KB) com as localizações nacionais e internacionais;
4. **Mentoria:** Apresentação das aulas e workshops com layout limpo, tipografia serif nos títulos e CTA em dourado;
5. **Contactos:** Formulário seguro com indicação de localização (Tomar) e botão flutuante WhatsApp para contacto direto;
6. **Prémio:** Página dedicada às distinções da artista, incluindo a Medalha de Criatividade (2014);
7. **Checkout (Sucesso/Cancelado):** Páginas de feedback pós-pagamento integradas com Stripe;
8. **Admin:** Painel de gestão protegido por autenticação;
9. **Login/Registo:** Fluxo de autenticação completo via Supabase Auth;
10. **Páginas legais:** Política de Privacidade e Termos de Serviço.

#### Layout e navegação

O componente `SiteLayout.tsx` (38 KB) gere todo o layout da aplicação: cabeçalho fixo com navegação principal, rodapé com informações de contacto e ligações para redes sociais, e transições suaves entre páginas via Framer Motion. A navegação é totalmente responsiva, adaptando-se a dispositivos móveis com menu hamburger.

### 4.2 Aplicação Móvel

Para complementar o website, foi desenvolvida uma aplicação móvel através da plataforma Glide. A aplicação disponibiliza uma experiência de navegação otimizada para dispositivos móveis, com acesso rápido ao catálogo de obras, informações de contacto e detalhes das aulas de mentoria. A opção pelo Glide permitiu um desenvolvimento ágil e sem custos de infraestrutura adicionais, mantendo a sincronização com os dados do catálogo principal.

### 4.3 Integração com Redes Sociais

A estratégia de redes sociais foi implementada em três vertentes:

- **Open Graph e meta tags:** Todas as páginas incluem metadados Open Graph estruturados que garantem pré-visualizações ricas quando partilhadas no Facebook, Instagram e Pinterest. Cada obra da galeria gera meta tags específicas com título, descrição e imagem;
- **Botão WhatsApp:** Implementação de um botão flutuante de contacto direto na página de contactos, reduzindo a fricção na comunicação com potenciais clientes e alunos;
- **Partilha direta:** Funcionalidades de partilha das obras nas principais redes sociais, incentivando a disseminação orgânica do conteúdo.

### 4.4 Mockups e Prototipagem

O processo de prototipagem seguiu uma abordagem iterativa, suportada por ferramentas profissionais:

1. **Figma (Design System):** O design system foi desenvolvido em Figma/HTML, com guidelines visuais documentadas. Os protótipos incluem páginas completas de homepage, galeria, sobre, contactos, mentoria e fluxo de checkout, todas com variantes responsivas (desktop, tablet, mobile);
2. **Componentes HTML estáticos:** Protótipos funcionais em HTML puro serviram como referência visual para a implementação final em Next.js;
3. **Validação com Ana Alexandre:** Cada iteração foi validada diretamente com a artista, garantindo o alinhamento entre a visão artística e a implementação técnica.

### 4.5 SEO e Otimização

A estratégia de SEO foi implementada de forma abrangente:

- **Meta tags dinâmicas:** Títulos e descrições únicos por página, gerados automaticamente pelo Next.js App Router com metadados estruturados;
- **Open Graph completo:** Imagens, títulos e descrições otimizados para partilha em redes sociais;
- **HTML semântico:** Estrutura com `<header>`, `<main>`, `<article>`, `<section>` e `<footer>`, garantindo acessibilidade e indexação correta;
- **Performance (Core Web Vitals):** SSR/SSG com Next.js, lazy loading de imagens e dos componentes 3D mais pesados, CDN global via Vercel e compressão automática de assets;
- **Internacionalização (i18n):** URLs localizadas e conteúdo traduzido para quatro idiomas, aumentando a visibilidade em motores de busca internacionais (PT, EN, ES e FR);
- **Sitemap e robots.txt:** Gerados automaticamente para facilitar a indexação pelos motores de busca.

---

## Capítulo 5 — Estratégias de Marketing Digital

### 5.1 Pesquisa e definição de palavras-chave

A estratégia de palavras-chave foi estruturada em três camadas de intenção:

**Palavras-chave primárias (transacionais):**
- "comprar arte original portuguesa"
- "pintura contemporânea online"
- "obras de arte para venda Portugal"
- "arte abstrata original comprar"

**Palavras-chave secundárias (informativas):**
- "aulas de pintura Tomar"
- "mentoria artística presencial"
- "atelier de arte em Portugal"
- "técnica mista sobre tela"

**Palavras-chave long-tail (nicho):**
- "artista plástica portuguesa contemporânea"
- "galeria online arte original autor"
- "pintura acrílico sobre tela venda direta"
- "workshops pintura Tomar Coimbra"

A pesquisa foi complementada com análise de termos multilingue — EN: "buy original Portuguese art"; ES: "arte portuguesa contemporánea"; FR: "acheter art portugais original" — para capitalizar o suporte i18n da plataforma.

### 5.2 Campanhas de marketing digital e geração de tráfego

A geração de tráfego foi planeada em quatro frentes:

1. **SEO Orgânico:** Otimização técnica completa (Core Web Vitals, HTML semântico, meta tags dinâmicas, i18n), produção de conteúdo nas páginas de detalhe das obras (fichas técnicas, descrições em quatro idiomas) e Open Graph para maximizar partilhas orgânicas;

2. **Marketing de conteúdo:** Publicação regular de conteúdos sobre o processo criativo da artista, bastidores do atelier e técnicas de pintura, posicionando Ana Alexandre como referência no seu domínio e atraindo tráfego qualificado;

3. **Redes sociais (orgânico):** Presença no Instagram (plataforma visual prioritária para arte), Facebook e LinkedIn, com partilha direta das obras da galeria, aproveitando as meta tags Open Graph configuradas;

4. **Email marketing (desenvolvimento futuro):** Captação de leads através dos formulários de contacto e inscrição em mentoria, com envio periódico de newsletters sobre novas obras, exposições e oportunidades de formação.

### 5.3 Gestão de leads e conversão de clientes

O funil de conversão foi estruturado com múltiplos pontos de entrada:

- **Galeria → Compra direta:** Para obras com preço definido (ex: *Dança Geométrica* a 800 EUR, *Fragmento Solar* a 600 EUR), o utilizador pode adicionar ao carrinho e concluir a compra via Stripe. As páginas de sucesso e cancelamento de checkout proporcionam feedback imediato;
- **Galeria → Pedido de consulta:** Para as obras "Sob Consulta" (19 das 21 obras), o utilizador é direcionado para o formulário de contacto ou para o WhatsApp, iniciando uma conversa personalizada;
- **Mentoria → Inscrição:** O formulário de inscrição nas aulas de pintura serve como ponto de captação de leads qualificados para a vertente formativa;
- **Contactos → Relação:** O formulário de contacto geral e o botão flutuante WhatsApp captam leads genéricos, que a artista gere diretamente.

### 5.4 Ferramentas de analytics e acompanhamento de resultados

O ecossistema de monitorização assenta nas seguintes ferramentas:

- **Google Analytics 4 (GA4):** Monitorização de páginas vistas, tempo de permanência, taxa de rejeição e fluxos de navegação por idioma;
- **Google Search Console:** Acompanhamento de impressões, cliques, CTR e posição média por palavra-chave e por país;
- **Stripe Dashboard:** Acompanhamento em tempo real de transações, volume de vendas, taxas de conversão de checkout e receita por período;
- **Supabase Dashboard:** Monitorização de utilizadores registados, sessões ativas e utilização da base de dados;
- **Vercel Analytics:** Métricas de performance (Core Web Vitals), distribuição geográfica do tráfego e tempos de resposta.

---

## Capítulo 6 — Resultados e Análise de Performance

### 6.1 Monitorização de métricas

À data de redação deste relatório, a plataforma encontra-se em fase de pré-lançamento, com os seguintes resultados técnicos verificados:

**Performance técnica:**
- As 10 páginas principais carregam sem erros, confirmado por auditoria automatizada;
- Consola do browser limpa em todas as páginas (sem erros JavaScript);
- Barra de navegação e rodapé funcionais e consistentes em todas as rotas;
- Componentes 3D (`Hero3D`) renderizam corretamente com interatividade;
- Sistema de filtros avançados da galeria funcional com 21 obras catalogadas;
- Mapa interativo de exposições operacional com dados reais de mais de 30 exposições.

**Conformidade visual:**
- Cor dourada (`#C4956A` / `#D4AF37`) aplicada consistentemente em textos, sublinhados e CTAs;
- Tipografia em maiúsculas com letter-spacing nos elementos de navegação;
- Identificação "ANA ALEXANDRE | ATELIER" presente em todas as páginas;
- Design responsivo validado em desktop, tablet e mobile.

### 6.2 Avaliação do impacto das campanhas

Dado que a plataforma se encontra em fase de pré-lançamento, as campanhas de marketing digital ainda não foram ativadas. No entanto, a infraestrutura técnica necessária para as suportar está integralmente implementada:

- Meta tags Open Graph configuradas para todas as páginas e obras individuais;
- URLs multi-idioma prontas para indexação internacional;
- Formulários de captação de leads operacionais (contacto e mentoria);
- Integração Stripe em modo de teste validada com sucesso para os fluxos de compra.

### 6.3 Feedback dos utilizadores e ajustes

O processo de validação com stakeholders revelou os seguintes ajustes implementados:

- **Galeria:** Evolução de uma página placeholder para um sistema completo com 21 obras, filtros avançados e layout masonry;
- **Página Sobre:** Adição do mapa interativo de exposições com dados reais de mais de 30 exposições nacionais e internacionais, em substituição de uma listagem estática;
- **Homepage:** Implementação de componentes 3D interativos (`Hero3D.tsx` e `HeroLivingCanvas.tsx`) para criar uma experiência imersiva diferenciadora;
- **Contactos:** Adição do botão flutuante WhatsApp por sugestão da artista, reduzindo a fricção no contacto.

### 6.4 Retorno sobre o investimento (ROI)

O investimento no projeto foi maioritariamente em tempo de desenvolvimento, com custos operacionais reduzidos, resultantes da escolha criteriosa da stack tecnológica:

| Serviço | Custo |
|---------|-------|
| Domínio (atelieranalexandre.com) | ~6 EUR/mês |
| Supabase (plano gratuito) | 0 EUR |
| Stripe | Pay-per-use (comissão por transação) |
| Vercel / Hosting (plano gratuito) | 0 EUR |
| Glide — aplicação móvel (plano gratuito) | 0 EUR |
| Claude Code | ~20 EUR |
| Figma | ~16 EUR |

O ROI projetado dependerá do volume de vendas e inscrições em mentoria. Com uma estrutura de custos fixos próxima dos 15 EUR/ano (excluindo ferramentas de desenvolvimento) e comissões de transação variáveis via Stripe, a plataforma apresenta um modelo economicamente sustentável, mesmo com volumes de vendas moderados.

---

## Capítulo 7 — Discussão

### 7.1 Desafios encontrados

O desenvolvimento da plataforma apresentou diversos desafios técnicos e estratégicos:

1. **Migração tecnológica:** A transição da stack inicial (HTML5 + Vanilla JS + PHP) para a stack moderna (Next.js 16 + TypeScript + Supabase) exigiu uma reescrita substancial do código, mas resultou numa plataforma significativamente mais robusta, performante e fácil de manter;

2. **Componentes 3D:** A integração de React Three Fiber e Three.js para o Hero 3D exigiu otimização cuidadosa para não comprometer a performance de carregamento da página, recorrendo a lazy loading e renderização condicional;

3. **Mapa de exposições:** O componente `ExposicoesMap.tsx` (83 KB) — o maior componente da aplicação — exigiu trabalho significativo de georreferenciação e visualização de dados para representar corretamente mais de 30 exposições em 7 países;

4. **Sistema de filtros:** O `ArtworkFilters.tsx` (28 KB) teve de suportar múltiplas dimensões de filtragem (categoria, técnica, série, preço, ano), mantendo uma UX intuitiva e performance adequada com 21 obras;

5. **Internacionalização:** A implementação de i18n nativo com quatro idiomas em toda a plataforma, incluindo a tradução das fichas técnicas das 21 obras, representou um esforço considerável de conteúdo e desenvolvimento;

6. **Dados reais:** A catalogação detalhada das 21 obras da artista (com fotografias, técnicas, dimensões, anos e descrições) exigiu colaboração estreita com Ana Alexandre para garantir precisão e autenticidade.

### 7.2 Comparação entre resultados esperados e obtidos

| Funcionalidade | Resultado Esperado | Estado |
|---|---|---|
| Website com design imersivo em modo escuro | Implementado com componentes 3D, animações Framer Motion e paleta dourado/preto | Concluído |
| Galeria online com fichas técnicas | 21 obras catalogadas com filtros avançados em 5 dimensões | Concluído |
| E-commerce com Stripe | Carrinho + checkout funcional (2 obras com preço, 19 sob consulta) | Concluído |
| Secção de Mentoria | Página completa com formulário de inscrição | Concluído |
| Internacionalização (4 idiomas) | PT, EN, ES, FR com middleware de deteção automática | Concluído |
| SEO com Open Graph | Meta tags dinâmicas em todas as páginas | Concluído |
| Responsividade | Validado em desktop, tablet e mobile | Concluído |
| Testes end-to-end | Validação funcional manual concluída; testes automatizados pendentes | Em curso |

Os resultados obtidos correspondem, no geral, aos objetivos inicialmente definidos. Alguns componentes — designadamente os elementos 3D interativos e o mapa de exposições — não constavam do plano original, tendo sido adicionados ao longo do desenvolvimento, elevando significativamente a qualidade da experiência do utilizador.

### 7.3 Melhorias e oportunidades de evolução

Com base na experiência de desenvolvimento e no feedback recolhido, identificaram-se as seguintes oportunidades de melhoria:

- **Testes automatizados:** Implementação de testes end-to-end com Playwright ou Cypress para validação contínua;
- **PWA (Progressive Web App):** Transformação em PWA para experiência offline e instalação no ecrã inicial;
- **Blog integrado:** Secção de conteúdos sobre arte, processo criativo e técnicas, otimizada para SEO;
- **Newsletter:** Sistema de email marketing para fidelização da audiência;
- **Analytics avançados:** Implementação completa de GA4 com eventos personalizados por interação com obras;
- **Módulos de formação online:** Plataforma de aulas gravadas e workshops ao vivo com sistema de pagamento recorrente;
- **Realidade Aumentada (AR):** Visualização de obras em espaços reais através da câmara do dispositivo.

---

## Capítulo 8 — Conclusões e Trabalho Futuro

### 8.1 Principais aprendizagens do projeto

O desenvolvimento do Atelier Ana Alexandre proporcionou aprendizagens relevantes em múltiplas dimensões:

1. **Técnica:** A migração de uma stack HTML/CSS/JS para Next.js 16 + TypeScript + Supabase demonstrou o valor das frameworks modernas em projetos de e-commerce. A tipagem estática do TypeScript preveniu erros em tempo de execução, enquanto o App Router do Next.js otimizou automaticamente a performance e o SEO;

2. **Design:** A abordagem *design-first* — com prototipagem em Figma, validação com a artista e implementação iterativa — garantiu que cada decisão visual serviu a valorização da obra, e não apenas a funcionalidade;

3. **Negócio:** A identificação de uma lacuna de mercado (artistas plásticos sem plataformas digitais dedicadas) validou a relevância do projeto e a viabilidade do modelo de negócio multi-vertente (venda + formação + formação online futura);

4. **Integração tecnológica:** A combinação de tecnologias modernas — React Three Fiber para 3D, React Simple Maps para geolocalização, Stripe para pagamentos e Supabase para base de dados — demonstrou que é possível construir uma plataforma premium com custos operacionais próximos de zero.

### 8.2 Trabalho Futuro

O roadmap de evolução da plataforma contempla três horizontes temporais:

- **Curto prazo:** Lançamento em produção, ativação do GA4, início da campanha de SEO orgânico e presença ativa no Instagram;
- **Médio prazo:** Implementação de blog integrado, sistema de newsletter e expansão do catálogo com novas obras;
- **Longo prazo:** Módulo de formação online (aulas gravadas e workshops ao vivo), conversão em PWA e potencial integração de Realidade Aumentada.

### 8.3 Impacto da solução no mercado

A plataforma Atelier Ana Alexandre posiciona-se como um modelo de referência no segmento de plataformas digitais para artistas plásticos independentes em Portugal. Ao demonstrar que é possível construir uma presença digital de qualidade com custos operacionais mínimos (aproximadamente 15 EUR/ano), o projeto pode servir de exemplo para outros artistas que procurem autonomia comercial.

A eliminação de intermediários — galerias tradicionais e marketplaces generalistas — permite que a totalidade da margem de venda reverta para a artista. Simultaneamente, a integração de galeria, loja e mentoria num único ecossistema digital cria uma proposta de valor diferenciadora no mercado português.

### 8.4 Sugestões para futuras expansões

1. **Inteligência Artificial:** Recomendações personalizadas de obras com base no comportamento de navegação do utilizador;
2. **Marketplace multi-artista:** Expansão da plataforma para incluir outros artistas, criando um marketplace curado de arte portuguesa contemporânea;
3. **NFTs e certificados digitais:** Emissão de certificados de autenticidade digitais associados a cada obra;
4. **Integração com APIs de arte:** Conexão com plataformas como Artsy e Artnet para ampliar a visibilidade;
5. **Sistema de leilão:** Implementação de funcionalidade de leilão para obras especiais ou edições limitadas.

---

## Apêndice A — Dados Adicionais

*Reservado para anexos relevantes para a compreensão do relatório, a incluir em versões futuras.*

---

# Observações Globais

## Principais problemas do relatório original

1. **Formatação inconsistente:** Grande parte do texto usa travessões (`-`) como marcadores de lista, sem formatação Markdown adequada, criando blocos densos e difíceis de ler. Secções como 1.2, 1.3, 4.1, 5.1 e 7.2 sofriam especialmente deste problema;

2. **Secção 3.3 sem substância:** A subsecção "Tecnologias utilizadas" não enumerava as tecnologias concretas — limitava-se a afirmações genéricas sobre "frameworks web robustos" e "serviços de nuvem", sem qualquer especificidade técnica. O leitor ficava sem informação objetiva sobre o que foi efetivamente utilizado;

3. **Frase incompleta na secção 6.4:** O texto terminava abruptamente com "Com uma margem bruta próxima dos 100", sem completar a ideia. Esta lacuna foi identificada e resolvida com base no contexto disponível;

4. **Linguagem promocional excessiva:** Várias secções — em especial a proposta de valor (2.1) e o impacto no mercado (8.3) — usavam um tom mais próximo do marketing do que do registo académico, com formulações como "plataforma premium" repetidas em excesso;

5. **Tabela 7.2 ilegível:** A comparação de resultados esperados vs. obtidos estava formatada como texto corrido com separadores `|`, tornando-a praticamente indecifrável. Foi convertida numa tabela Markdown adequada;

6. **Ausência de estrutura na secção 4.1:** As páginas implementadas e os detalhes do design system apareciam misturados num único bloco de texto, sem hierarquia visual nem separação por subsecções;

7. **Mistura de Português do Brasil:** Algumas expressões — como "projeto" sem acento (também válido em PT-PT após o AO1990), mas sobretudo construções frásicas — apresentavam influência do português do Brasil. A versão melhorada normaliza para o registo europeu.

## O que foi melhorado

- Todos os blocos de listas foram convertidos para marcadores Markdown (`-` ou `•` com espaço adequado);
- A secção 3.3 foi reescrita com a enumeração concreta das tecnologias utilizadas, consolidando informação dispersa por outros capítulos do próprio relatório;
- A tabela SWOT (2.4) foi reformatada como tabela Markdown legível;
- A tabela de cronograma (3.4) foi mantida e formatada corretamente;
- A tabela de comparação de resultados (7.2) foi convertida de texto para tabela;
- A secção 4.1 foi subdividida em "Design System", "Páginas implementadas" e "Layout e navegação";
- A frase incompleta em 6.4 foi completada com base no contexto;
- A linguagem promocional foi moderada, mantendo o tom assertivo mas adequando-o ao registo académico;
- Foram corrigidas inconsistências de estilo ao longo de todo o documento.

## Sugestões adicionais para aumentar a qualidade académica

1. **Referências bibliográficas:** O relatório não inclui qualquer citação ou referência bibliográfica. Para um trabalho académico, seria essencial referenciar fontes sobre e-commerce, marketing digital, mercado de arte online e as frameworks tecnológicas utilizadas (documentação oficial, artigos científicos ou estudos de mercado);

2. **Dados quantitativos:** Sempre que possível, substituir afirmações qualitativas por dados mensuráveis. Por exemplo, em vez de "crescimento do mercado de arte digital", citar estatísticas concretas de fontes como o relatório Art Basel & UBS ou Hiscox Online Art Trade Report;

3. **Secção de testes mais detalhada:** O relatório menciona testes end-to-end, mas não descreve a metodologia, os casos de teste definidos nem os critérios de aceitação. Uma subsecção dedicada fortaleceria a credibilidade técnica do trabalho;

4. **Análise crítica mais aprofundada (Cap. 7):** A discussão poderia explorar com mais rigor as limitações do projeto — por exemplo, a ausência de dados reais de vendas impede qualquer avaliação de ROI efetiva;

5. **Apêndice A vazio:** O apêndice de dados adicionais está vazio. Seria pertinente incluir screenshots da plataforma, excertos de código relevantes, ou resultados de auditorias de performance (ex: Lighthouse scores);

6. **Consistência nas referências a ficheiros:** O relatório alterna entre caminhos de ficheiro com e sem aspas, e por vezes mistura a notação Next.js com a estrutura real do projeto. Uma revisão final de consistência seria recomendável.
