# 07 — SEO e Performance

## SEO — estado actual

### index.html (meta tags estáticas)
```html
<title>Ana Alexandre — Atelier de Arte</title>
<meta name="description" content="...">
<meta property="og:image" content="/og-image.png">  <!-- ← URL relativa -->
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#C4956A">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### Problemas de SEO

**S1 — og:image com URL relativa**
Resolvido no `index.html` para o domínio canónico `https://ana-alexandre.pt/`.

**S2 — SPA sem SSR = SEO por obra inexistente**
Quando `/galeria/slug-da-obra` é partilhado no WhatsApp/Facebook/LinkedIn:
- O crawler recebe o `index.html` genérico
- `og:title` e `og:image` são sempre os da homepage
- A obra específica não aparece na pré-visualização
Fix mínimo: pre-render estático das páginas de obra (SSG) ou aceitar limitação.

**S3 — Sitemap quebrado**
`api/sitemap.ts` existe e usa agora `SITE_URL` / `VITE_PUBLIC_SITE_URL` como fonte de verdade do domínio público.

**S4 — `useSEO` hook**
Existe `src/lib/useSEO.ts` que actualiza `document.title` e meta tags dinâmicamente.
Agora usa `src/lib/site.ts` com `VITE_PUBLIC_SITE_URL` como fonte de verdade.
Usado no CheckoutPage: `useSEO({ title: "Checkout — Ana Alexandre", url: "/checkout" })`.
Funciona para utilizadores mas não para crawlers (JS não executado).

### robots.txt

`public/robots.txt` existe (por confirmar conteúdo). Deve permitir crawl das páginas públicas e bloquear `/admin`.

---

## Performance — estado actual

### Bundle

- Vite com code-splitting por rota (lazy loading) ✅
- Nenhuma análise de bundle size feita ainda
- Dependências pesadas a verificar: Recharts, Radix UI, motion

### Assets

- `vercel.json` configura `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` ✅
- Imagens das obras: sem `loading="lazy"` explícito verificado (por confirmar)
- Sem `srcset` ou `<picture>` para responsive images — todas as imagens em tamanho original

### Fonts

- `--font-serif` via CSS variable (por confirmar se é Google Fonts ou self-hosted)
- Sem `font-display: swap` verificado

### Vite config (vite.config.ts)

- Plugin custom para mapear assets Figma (hash → nome legível)
- `hmr: { overlay: false }` — oculta erros HMR em dev
- Sem configuração de chunk splitting manual

### LCP / CLS

- Hero image: por confirmar se tem `fetchpriority="high"` ou `loading="eager"`
- Animações `motion/react` no hero — risco de CLS se layout shift

---

## Recomendações prioritárias

| Prioridade | Acção |
|-----------|-------|
| Alta | Fix `og:image` para URL absoluta |
| Alta | Criar `public/sitemap.xml` estático |
| Alta | Remover/substituir rewrite `/sitemap.xml` em vercel.json |
| Média | Adicionar `loading="lazy"` às imagens da galeria |
| Média | Pre-render mínimo para páginas de obra (ou aceitar limitação SPA) |
| Baixa | Analisar bundle size com `vite-bundle-visualizer` |
| Baixa | Verificar `font-display: swap` |

### Actualizacao 2026-04-13

- ImageWithFallback passa a usar lazy/async por omissao e priority explicito para imagens above-the-fold
- HomePage lazy-load de ExposicoesMap e CurvedCarousel com Suspense + IntersectionObserver`r
- ite.config.ts ganhou manualChunks para endor-react, endor-motion, endor-map, endor-supabase e endor-stripe`r
- GaleriaPage ganhou sizes nas imagens principais e hero com prioridade explicita
- Build apos alteracao: HomePage ~28.6 kB, ExposicoesMap ~47.0 kB, CurvedCarousel ~7.5 kB, index ~89.7 kB

### Actualizacao 2026-04-13 - SEO social de obras

- O SEO social das paginas de obra deixou de depender apenas de `useSEO()` client-side.
- Foi adicionada a function `api/obra-meta.ts`, que devolve HTML leve com `title`, `description`, `canonical`, `og:url`, `og:image` e tags Twitter por obra.
- `vercel.json` ganhou rewrite especifico para `/galeria/:slug` quando o request vem de crawlers sociais comuns (`facebookexternalhit`, `Facebot`, `Twitterbot`, `LinkedInBot`, `WhatsApp`, `Slackbot`, `Discordbot`, `TelegramBot`, `SkypeUriPreview`).
- Para utilizadores normais, o site continua SPA e cai no rewrite global para `index.html`.
- `api/sitemap.ts` passou a incluir `image:image` nas URLs de obra quando `imagem_url` existe.
- `ObraPage.tsx` continua a usar `useSEO()` para consistencia no browser, mas previews sociais ja nao dependem de JS.

### Cobertura actual

- Coberto server-side para crawlers: `/galeria/:slug`
- Continuam client-side/static: homepage e restantes paginas SPA
- Dominio canonico continua `https://ana-alexandre.pt`

### Limitacoes assumidas

- Nao e SSR/SSG completo; e uma solucao intermédia e pragmatica para previews sociais.
- A cobertura server-side foi priorizada nas paginas de obra, que sao o caso critico de partilha.
- Bots que nao correspondam ao matcher de user-agent continuam a receber o HTML da SPA.

