import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { LanguageProvider } from "./i18n";
import { CartProvider } from "../lib/cart";

export default function App() {

  return (
    <LanguageProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </LanguageProvider>
  );
}