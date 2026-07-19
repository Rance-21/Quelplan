import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const lightBackgroundStorageKey = "quelplan-light-background-path";
const darkBackgroundStorageKey = "quelplan-dark-background-path";

interface BackgroundSettingValue {
  lightBackgroundPath: string;
  darkBackgroundPath: string;
  setLightBackgroundPath: (path: string) => void;
  setDarkBackgroundPath: (path: string) => void;
}

const BackgroundSettingContext = createContext<BackgroundSettingValue | null>(
  null,
);

function readStoredBackgroundPath(storageKey: string) {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem(storageKey) || "";
}

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [lightBackgroundPath, setLightBackgroundPathState] = useState(() =>
    readStoredBackgroundPath(lightBackgroundStorageKey),
  );
  const [darkBackgroundPath, setDarkBackgroundPathState] = useState(() =>
    readStoredBackgroundPath(darkBackgroundStorageKey),
  );

  const setLightBackgroundPath = useCallback((path: string) => {
    window.localStorage.setItem(lightBackgroundStorageKey, path);
    setLightBackgroundPathState(path);
  }, []);

  const setDarkBackgroundPath = useCallback((path: string) => {
    window.localStorage.setItem(darkBackgroundStorageKey, path);
    setDarkBackgroundPathState(path);
  }, []);

  const value = useMemo(
    () => ({
      lightBackgroundPath,
      darkBackgroundPath,
      setLightBackgroundPath,
      setDarkBackgroundPath,
    }),
    [
      lightBackgroundPath,
      darkBackgroundPath,
      setLightBackgroundPath,
      setDarkBackgroundPath,
    ],
  );

  return (
    <BackgroundSettingContext.Provider value={value}>
      {children}
    </BackgroundSettingContext.Provider>
  );
}

export function useBackgroundSettings() {
  const context = useContext(BackgroundSettingContext);
  if (context) return context;

  return {
    lightBackgroundPath: "",
    darkBackgroundPath: "",
    setLightBackgroundPath: () => undefined,
    setDarkBackgroundPath: () => undefined,
  };
}
