import { useNuiEvent } from "@/hooks/useNuiEvent";
import { cn } from "@/lib/utils";
import { useState } from "react";

const parseText = (str: string) => {
  const parts = str.split(/(~[^~]+~)/g).filter(Boolean);
  return parts.map((part, index) => {
    const match = part.match(/~([^~]+)~/);
    if (match) {
      const key = match[1];
      return (
        <span
          key={index}
          className="bg-foreground text-background px-1.5 py-0.5 rounded text-xs font-bold"
        >
          {key}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const HelpText = () => {
  const [text, setText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useNuiEvent<{ text: string; show: boolean }>("showHelp", (data) => {
    if (data.show) {
      setText(data.text);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  if (!isVisible) return null;
  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 bg-background",
        "px-4 py-2 rounded-lg",
        "text-sm",
      )}
    >
      {parseText(text)}
    </div>
  );
};

export default HelpText;
