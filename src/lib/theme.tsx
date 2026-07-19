import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { showToast } from "../components/ui/Toast";
import { translate } from "./i18n";

export type ThemeMode = "light" | "dark" | "system";
type ResolvedThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = "quelplan-theme-mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") return "system";

  const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(storedMode) ? storedMode : "system";
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemMode, setSystemMode] =
    useState<ResolvedThemeMode>(getSystemMode);

  const resolvedMode = mode === "system" ? systemMode : mode;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemMode(getSystemMode());

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedMode === "dark");
    document.documentElement.style.colorScheme = resolvedMode;
  }, [resolvedMode]);

  const setMode = (nextMode: ThemeMode) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    setModeState(nextMode);
  };

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode }),
    [mode, resolvedMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  useEffect(() => {
    if (!context) {
      showToast(translate("toast.themeProviderMissing"), "error");
    }
  }, [context]);

  if (context) return context;

  return {
    mode: "system" as const,
    resolvedMode: getSystemMode(),
    setMode: () => {
      showToast(translate("toast.themeSwitchUnavailable"), "error");
    },
  };
}
