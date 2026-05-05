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
        return "-translate-x-1/2 translate-y-[800%]";
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
          "relative",
          "w-[1100px]",
          "max-h-[850px]",
          "absolute top-1/2 left-1/2",
          getPositionClass(),
          "rounded-2xl",
          "transition-transform duration-500 ease-in-out",
          "overflow-hidden",
          "bg-slate-900",
          "border-2 border-cyan-500/50",
          "shadow-[0_0_60px_rgba(0,200,255,0.2)]",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl" />
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

        <div className="relative z-10 p-6 overflow-y-auto max-h-[850px] scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
          {children}
        </div>
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
        variant="outline"
        size="sm"
        className="border-cyan-500/30 hover:bg-cyan-500/10"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Visible }]);
        }}
      >
        Show
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-cyan-500/30 hover:bg-cyan-500/10"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Minimized }]);
        }}
      >
        Minimize
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-cyan-500/30 hover:bg-cyan-500/10"
        onClick={() => {
          debugData([{ action: "setFrameState", data: FrameState.Hidden }]);
        }}
      >
        Hide
      </Button>
    </div>
  );
};
