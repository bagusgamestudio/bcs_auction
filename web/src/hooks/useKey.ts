import { useEffect } from "react";

export const useKey = (key: string, callback: () => void) => {
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === key) callback();
    };
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler);
    };
  }, []);
};
