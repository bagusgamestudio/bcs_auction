import { useNuiEvent } from "@/hooks/useNuiEvent";
import { useState } from "react";

const DUIPage = () => {
  const [url, setUrl] = useState(
    "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg"
  );

  useNuiEvent<string>("setBackground", setUrl);

  return (
    <div
      className="w-screen h-screen bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${url})`,
      }}
    />
  );
};

export default DUIPage;