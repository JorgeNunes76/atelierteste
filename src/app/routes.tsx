import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { AdminProtected } from "./components/AdminProtected";
import { RequireAuth } from "./components/RequireAuth";

// ── Fallback Global UI ─────────────────────────────
const FullScreenLoader = () => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A96E", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
    A carregar...
  </div>
);

// ── Lazy Loads (Code Splitting) ────────────────────
const HomePage = lazy(() => import("../pages/HomePage").then(m => ({ default: m.HomePage })));
const GaleriaPage = lazy(() => import("../pages/GaleriaPage").then(m => ({ default: m.GaleriaPage })));
const ObraPage = lazy(() => import("../pages/ObraPage").then(m => ({ default: m.ObraPage })));
const SobrePage = lazy(() => import("../pages/SobrePage").then(m => ({ default: m.SobrePage })));
const MentoriaPage = lazy(() => import("../pages/MentoriaPage").then(m => ({ default: m.MentoriaPage })));
const ContactosPage = lazy(() => import("../pages/ContactosPage").then(m => ({ default: m.ContactosPage })));
const PremioPage = lazy(() => import("../pages/PremioPage").then(m => ({ default: m.PremioPage })));
const LoginPage = lazy(() => import("../pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const TermosPage = lazy(() => import("../pages/TermosPage").then(m => ({ default: m.TermosPage })));
const PrivacidadePage = lazy(() => import("../pages/PrivacidadePage").then(m => ({ default: m.PrivacidadePage })));
const ReclamacoesPage = lazy(() => import("../pages/ReclamacoesPage").then(m => ({ default: m.ReclamacoesPage })));
const SucessoPage = lazy(() => import("../pages/SucessoPage").then(m => ({ default: m.SucessoPage })));
const RecoverPasswordPage = lazy(() => import("../pages/RecoverPasswordPage").then(m => ({ default: m.RecoverPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const CarrinhoPage = lazy(() => import("../pages/CarrinhoPage").then(m => ({ default: m.CarrinhoPage })));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

export const router = createBrowserRouter([
  { path: "/login", element: <Suspense fallback={<FullScreenLoader />}><LoginPage /></Suspense> },
  { path: "/register", element: <Suspense fallback={<FullScreenLoader />}><RegisterPage /></Suspense> },
  { path: "/admin", Component: AdminProtected },
  { path: "/recuperar-password", element: <Suspense fallback={<FullScreenLoader />}><RecoverPasswordPage /></Suspense> },
  { path: "/reset-password", element: <Suspense fallback={<FullScreenLoader />}><ResetPasswordPage /></Suspense> },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "galeria", Component: GaleriaPage },
      { path: "galeria/:id", Component: ObraPage },
      { path: "sobre", Component: SobrePage },
      { path: "orientacao", Component: MentoriaPage },
      { path: "contactos", Component: ContactosPage },
      { path: "premio", Component: PremioPage },
      { path: "termos", Component: TermosPage },
      { path: "privacidade", Component: PrivacidadePage },
      { path: "reclamacoes", Component: ReclamacoesPage },
      { path: "sucesso", Component: SucessoPage },
      { path: "carrinho", Component: CarrinhoPage },
      {
        path: "checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
