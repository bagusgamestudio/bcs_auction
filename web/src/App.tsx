import { Route, Routes, useNavigate } from "react-router-dom";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { debugData } from "@/utils/debugData";
import { useState } from "react";
import CreatePage from "./pages/create";
import ViewPage from "./pages/view";
import EditPage from "./pages/edit";
import Frame from "@/components/frame";
import HomePage from "./pages/home";
import { PlayerProvider } from "./hooks/usePlayer";
import { Config } from "./store/config";

function App() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useNuiEvent("setPage", (page: string) => {
    navigate(`/${page}`);
  });

  useNuiEvent<boolean>("setVisible", setVisible);

  useNuiEvent("setConfig", (config: Record<string, any>) => {
    Object.keys(config).forEach((key) => {
      Config[key] = config[key];
    });
  });

  if (!visible) return null;

  return (
    <div className="h-screen overflow-hidden">
      <PlayerProvider>
        <Frame>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/view/:id" element={<ViewPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/edit/:id" element={<EditPage />} />
          </Routes>
        </Frame>
      </PlayerProvider>
    </div>
  );
}

export default App;

debugData([{ action: "initUI", data: {} }]);
debugData([{ action: "setPage", data: "" }]);
debugData([{ action: "setVisible", data: true }]);
debugData([{ action: "setPlayer", data: { identifier: "", isAdmin: false } }]);
