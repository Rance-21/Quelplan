import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSettings,
  updateLaunchKey,
  updateSetting,
  type AppSettings,
} from "../api/setting";

interface AppSettingsContextValue extends AppSettings {
  setAutoStart: (value: boolean) => void;
  setHideOnLaunch: (value: boolean) => void;
  setCloseToTray: (value: boolean) => void;
  setLaunchKey: (launchKey: string) => void;
}

const defaultAppSettings: AppSettings = {
  autoStart: false,
  hideOnLaunch: false,
  closeToTray: false,
  launchKey: "F9",
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

type BooleanSettingKey = "autoStart" | "hideOnLaunch" | "closeToTray";

const booleanSettingCommands = {
  autoStart: "AutoStart",
  hideOnLaunch: "HideOnLaunch",
  closeToTray: "CloseTary",
} as const;

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    let isMounted = true;

    void getSettings()
      .then((nextSettings) => {
        if (isMounted) {
          setSettings(nextSettings);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const commitSetting = useCallback(
    function commitSetting<K extends keyof AppSettings>(
      key: K,
      value: AppSettings[K],
      persist: () => Promise<void>,
    ) {
      void persist()
        .then(() => {
          setSettings((currentSettings) => ({
            ...currentSettings,
            [key]: value,
          }));
        })
        .catch(() => undefined);
    },
    [],
  );

  const setBooleanSetting = useCallback(
    (key: BooleanSettingKey, value: boolean) => {
      commitSetting(key, value, () =>
        updateSetting(booleanSettingCommands[key], value),
      );
    },
    [commitSetting],
  );

  const setAutoStart = useCallback(
    (value: boolean) => setBooleanSetting("autoStart", value),
    [setBooleanSetting],
  );
  const setHideOnLaunch = useCallback(
    (value: boolean) => setBooleanSetting("hideOnLaunch", value),
    [setBooleanSetting],
  );
  const setCloseToTray = useCallback(
    (value: boolean) => setBooleanSetting("closeToTray", value),
    [setBooleanSetting],
  );

  const setLaunchKey = useCallback(
    (launchKey: string) =>
      commitSetting("launchKey", launchKey, () => updateLaunchKey(launchKey)),
    [commitSetting],
  );

  const value = useMemo(
    () => ({
      ...settings,
      setAutoStart,
      setHideOnLaunch,
      setCloseToTray,
      setLaunchKey,
    }),
    [settings, setAutoStart, setHideOnLaunch, setCloseToTray, setLaunchKey],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings(): AppSettingsContextValue {
  const context = useContext(AppSettingsContext);
  if (context) return context;

  return {
    ...defaultAppSettings,
    setAutoStart: () => undefined,
    setHideOnLaunch: () => undefined,
    setCloseToTray: () => undefined,
    setLaunchKey: () => undefined,
  };
}
