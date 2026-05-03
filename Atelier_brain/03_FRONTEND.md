# 03 — Frontend

## Estrutura de pastas

```
src/
├── app/
│   ├── routes.tsx          routing React Router v7 (lazy + guards)
│   ├── App.tsx             root component + providers
│   └── components/         AdminHeader, AdminSidebar, guards de auth
├── pages/                  páginas públicas e de utilizador
├── features/admin/         painel admin completo
│   └── views/
│       ├── Dashboard/      KPIs: total obras, mensagens não lidas, vendas
│       ├── Artworks/       CRUD obras + upload imagem
│       ├── Sales/          listagem vendas + mudança de estado
│       ├── Messages/       contactos + marcar lido + delete
│       ├── Content/        editar config_site via UI
│       └── Settings/       configurações admin
├── lib/                    serviços (ver 02_ARCHITECTURE)
└── styles/                 CSS global + Tailwind + fontes
```

## Páginas públicas

| Página | Ficheiro | Notas |
|--------|----------|-------|
| Home | `pages/HomePage.tsx` | Hero, obras destaque, CTA |
| Galeria | `pages/GaleriaPage.tsx` | Grid de obras do Supabase |
| Obra individual | `pages/ObraPage.tsx` | Detalhe, add to cart, SEO dinâmico |
| Carrinho | `pages/CarrinhoPage.tsx` | Lista + remove + CTA checkout |
| Checkout | `pages/CheckoutPage.tsx` | 2 steps: entrega + pagamento ← CRÍTICO |
| Sucesso | `pages/SucessoPage.tsx` | Confirmação pós-compra |
| Sobre | `pages/SobrePage.tsx` | Bio artista |
| Mentoria | `pages/MentoriaPage.tsx` | Preços de config_site |
| Contactos | `pages/ContactosPage.tsx` | Formulário + FAQ |
| Login | `pages/LoginPage.tsx` | |
| Register | `pages/RegisterPage.tsx` | |
| RecoverPassword | `pages/RecoverPasswordPage.tsx` | |
| ResetPassword | `pages/ResetPasswordPage.tsx` | |

## Design System

- **Tokens** (fonte única de verdade): `src/lib/tokens.ts`
  - `GOLD = "#C4956A"`, `CHARCOAL = "#2C2318"`, `CREAM = "#F9F8F6"`, `SLATE`
- **Fontes**: variável CSS `--font-serif` + system-ui fallback
- **Estilo geral**: minimalista luxo — sem shadows excessivos, espaçamento generoso
- **Tailwind**: configurado em `tailwind.config.js`; classes utilitárias + inline styles coexistem

## CheckoutPage — componente crítico

**Ficheiro:** `src/pages/CheckoutPage.tsx`

### Estado interno

```typescript
step: 1 | 2                  // step 1: entrega, step 2: pagamento
form: { nome, email, telefone, nif, morada, codigoPostal, cidade, notas }
paymentMethod: "card" | "transfer"
sending: boolean
error: string
```

### Pre-fill de sessão
Preenche `email` e `nome` do utilizador autenticado via `supabase.auth.getSession()` no `useEffect`.

### Validação de avanço (step 1 → 2)
```typescript
const canAdvance = form.email && form.morada && form.codigoPostal && form.cidade;
```
⚠️ `form.nome` não é validado — campo pode estar vazio.

### BANK const — PLACEHOLDER
```typescript
// linha 14 — DADOS FICTÍCIOS — substituir antes de produção
const BANK = { iban: "PT50 0000 0000 0000 0000 0000 0", mbway: "+351 9xx xxx xxx" };
```
→ Ver [[09_ROADMAP]] item D1 para correcção.

### Subcomponentes internos
- `Steps` — barra de progresso 3 passos
- `FormCard` — card de secção do formulário
- `FloatingInput` — input com label flutuante animado
- `PaymentOption` — radio card de método de pagamento
- `CardLogos` — ícones SVG Visa/Mastercard/Apple Pay

## Carrinho (cart)

**Ficheiro:** `src/lib/cart.tsx`

- Persiste em `localStorage` com key `atelier_cart`
- Interface `ObraCarrinho`: `{ id, titulo, preco, imagem_url, tecnica }`
- Preços no carrinho são **apenas para display** — preços reais validados server-side
- `useCart()` exporta: `items`, `totalPrice`, `addItem`, `removeItem`, `clearCart`

## i18n

**Ficheiro:** `src/app/i18n.tsx`
- Suporte pt/es/fr/en configurado mas **não activo por defeito** na UI
- A implementar na fase de internacionalização (baixa prioridade)

## Responsividade

- Tailwind breakpoints standard
- CheckoutPage usa `flex-col lg:flex-row` para layout de 2 colunas
- Admin sidebar colapsa em mobile (por confirmar comportamento exacto)

## Performance

- Todas as rotas em lazy loading via `React.lazy` + `Suspense`
- Assets em `/assets/*` com `Cache-Control: immutable` (vercel.json)
- `hmr.overlay: false` no vite.config — pode ocultar erros em dev
