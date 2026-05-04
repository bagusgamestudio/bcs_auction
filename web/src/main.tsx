import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isEnvBrowser } from "./utils/misc.ts";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { HashRouter, Route, Routes } from "react-router-dom";
import HelpText from "./components/help-text.tsx";
import Bid from "./components/bid.tsx";
import DUIPage from "./pages/dui.tsx";

const root = document.getElementById("root")!;
if (isEnvBrowser()) {
  root.className = "w-screen h-screen bg-green-500";
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="bcs_character_theme">
      <HelpText />
      <Bid />
      <HashRouter>
        <Routes>
          <Route path="/dui" element={<DUIPage />} />
        </Routes>
        <App />
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
