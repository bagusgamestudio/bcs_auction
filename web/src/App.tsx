import { Route, Routes, useNavigate } from "react-router-dom";
import { useNuiEvent } from "@/hooks/useNuiEvent";
import { debugData } from "@/utils/debugData";
import { useState } from "react";
import CreatePage from "./pages/create";
import Frame from "@/components/frame";

function App() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useNuiEvent("setPage", (page: string) => {
    navigate(`/${page}`);
  });

  useNuiEvent<boolean>("setVisible", setVisible);

  if (!visible) return null;

  return (
    <div className="h-screen overflow-hidden">
      <Frame>
        <Routes>
          <Route path="/" element={<>Home</>} />
          <Route path="/create" element={<CreatePage />} />
        </Routes>
      </Frame>
    </div>
  );
}

export default App;

debugData([{ action: "initUI", data: {} }]);
debugData([{ action: "setPage", data: "" }]);
debugData([{ action: "setVisible", data: true }]);
