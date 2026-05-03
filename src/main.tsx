
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { initClientObservability } from "./lib/observability";
  import "./styles/index.css";

  initClientObservability();
  createRoot(document.getElementById("root")!).render(<App />);
  
