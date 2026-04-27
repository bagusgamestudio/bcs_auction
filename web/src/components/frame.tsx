import { useNuiEvent } from "@/hooks/useNuiEvent";
import { cn } from "@/lib/utils";
import { debugData } from "@/utils/debugData";
import { isEnvBrowser } from "@/utils/misc";
import { useState } from "react";
import { Button } from "./ui/button";
import { useKey } from "@/hooks/useKey";
import { fetchNui } from "@/utils/fetchNui";
export enum FrameState {
  Hidden = "hidden",
  Minimized = "minimized",
  Visible = "visible",
}
const isBrowser = isEnvBrowser();

const Frame = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<FrameState>(
    isBrowser ? FrameState.Visible : FrameState.Hidden,
  );

  const getPositionClass = () => {
    switch (state) {
      case FrameState.Hidden:
        return "-translate-x-1/2 translate-y-[400%]";
      case FrameState.Minimized:
        return "-translate-x-1/2 translate-y-[60%]";
      case FrameState.Visible:
        return "-translate-x-1/2 -translate-y-1/2";
    }
  };

  useNuiEvent<FrameState>("setFrameState", (data) => {
    setState(data);
  });

  useKey("Escape", () => {
    fetchNui("closeFrame");
  });

  return (
    <>
      <div
        className={cn(
          "bg-background",
          "w-[1000px]",
          "max-h-[800px]",
          "absolute top-1/2 left-1/2",
          getPositionClass(),
          "rounded-3xl",
          "p-4",
          "transition-transform duration-500 ease-in-out",
        )}
      >
        {children}
      </div>
      <DebugFrame />
    </>
  );
};

export default Frame;

const DebugFrame = () => {
  if (!isBrowser) return null;

  return (
    <div className="flex gap-2 mt-4 absolute left-1/2 top-0 transform -translate-x-1/2">
      <Button
        className="button-dashed"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Visible }]);
        }}
      >
        Show
      </Button>
      <Button
        className="button-dashed"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Minimized }]);
        }}
      >
        Minimize
      </Button>
      <Button
        className="button-dashed"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Hidden }]);
        }}
      >
        Hide
      </Button>
    </div>
  );
};
