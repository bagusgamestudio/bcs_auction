import { createContext, useContext, useState } from "react";
import { useNuiEvent } from "./useNuiEvent";

interface Player {
  identifier: string;
  isAdmin: boolean;
}

interface PlayerContextValue {
  player: Player | null;
  setPlayer: (player: Player | null) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
};

interface PlayerProviderProps {
  children: React.ReactNode;
  initialPlayer?: Player | null;
}

export const PlayerProvider = ({
  children,
  initialPlayer = null,
}: PlayerProviderProps) => {
  const [player, setPlayer] = useState<Player | null>(initialPlayer);

  useNuiEvent<{ identifier: string; isAdmin: boolean }>(
    "setPlayer",
    (player) => {
      setPlayer(player);
    },
  );

  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};
