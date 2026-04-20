import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isEnvBrowser } from "./utils/misc.ts";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { HashRouter } from "react-router-dom";

const root = document.getElementById("root")!;
if (isEnvBrowser()) {
  root.className =
    "w-screen h-screen bg-green-500";
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="bcs_character_theme">
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
