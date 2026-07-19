import { useCallback, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { exportByfen, importByfen } from "../api/Byfen";
import {
  imageFileExtensions,
  selectDirectory,
  selectSingleFile,
} from "../api/Dialog";
import { openFolder } from "../api/OpenFolder";
import { BackgroundSelectButton } from "../components/setting/BackgroundSelectButton";
import { DataTransferButton } from "../components/setting/DataTransferButton";
import { LaunchKeyButton } from "../components/setting/LaunchKeyButton";
import {
  SegmentedControl,
  SettingSwitch,
} from "../components/setting/SettingControls";
import { TokenSettingsPanel } from "../components/setting/TokenSettingsPanel";
import { showToast } from "../components/ui/Toast";
import { useAppSettings } from "../lib/appSettings";
import { useBackgroundSettings } from "../lib/background";
import {
  useI18n,
  type Locale,
  type LocaleMode,
  type TranslationKey,
} from "../lib/i18n";
import { useTheme, type ThemeMode } from "../lib/theme";

export interface SettingRow {
  id: string;
  title: string;
  description?: string;
  disabled?: boolean;
  content: ReactNode;
  expanded?: boolean;
  expandedContent?: ReactNode;
}

type ByfenOperation = "export" | "import";

const projectUrl = "https://github.com/Rance-21/Quelplan";

const localeLabelKeys: Record<Locale, TranslationKey> = {
  zh: "common.language.zh",
  en: "common.language.en",
};

const themeLabelKeys: Record<ThemeMode, TranslationKey> = {
  system: "common.theme.system",
  light: "common.theme.light",
  dark: "common.theme.dark",
};

const byfenActions = {
  export: {
    run: exportByfen,
    confirmKey: undefined,
    successKey: "toast.exportByfenSuccess",
    reload: false,
  },
  import: {
    run: importByfen,
    confirmKey: "confirm.importByfen",
    successKey: "toast.importByfenSuccess",
    reload: true,
  },
} satisfies Record<
  ByfenOperation,
  {
    run: (directory: string) => Promise<void>;
    confirmKey?: TranslationKey;
    successKey: TranslationKey;
    reload: boolean;
  }
>;

export function useSettingsRows(): SettingRow[] {
  const { mode, resolvedMode, setMode } = useTheme();
  const { localeMode, locale, setLocaleMode, t } = useI18n();
  const {
    autoStart,
    hideOnLaunch,
    closeToTray,
    launchKey,
    setAutoStart,
    setHideOnLaunch,
    setCloseToTray,
    setLaunchKey,
  } = useAppSettings();
  const [isTokensExpanded, setIsTokensExpanded] = useState(false);
  const [byfenOperation, setByfenOperation] =
    useState<ByfenOperation | null>(null);
  const byfenOperationRef = useRef<ByfenOperation | null>(null);
  const {
    lightBackgroundPath,
    darkBackgroundPath,
    setLightBackgroundPath,
    setDarkBackgroundPath,
  } = useBackgroundSettings();

  const handleSelectBackground = useCallback(
    async (onSelected: (path: string) => void) => {
      const selectedPath = await selectSingleFile({
        filterName: t("settings.fileFilter.image"),
        extensions: imageFileExtensions,
      });
      if (selectedPath) onSelected(selectedPath);
    },
    [t],
  );

  const handleByfenOperation = useCallback(
    async (operation: ByfenOperation) => {
      if (byfenOperationRef.current) return;

      const action = byfenActions[operation];
      let shouldReload = false;
      byfenOperationRef.current = operation;
      setByfenOperation(operation);

      try {
        const selectedDirectory = await selectDirectory();
        if (!selectedDirectory) return;
        if (action.confirmKey && !window.confirm(t(action.confirmKey))) return;

        await action.run(selectedDirectory);
        shouldReload = action.reload;
        showToast(t(action.successKey), "success");
        if (shouldReload) {
          window.setTimeout(() => window.location.reload(), 600);
        }
      } catch {
        return;
      } finally {
        if (!shouldReload) {
          byfenOperationRef.current = null;
          setByfenOperation(null);
        }
      }
    },
    [t],
  );

  const languageOptions: { value: LocaleMode; label: string }[] = [
    { value: "system", label: t("common.language.system") },
    { value: "zh", label: t("common.language.zh") },
    { value: "en", label: t("common.language.en") },
  ];
  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: "system", label: t("common.theme.system") },
    { value: "light", label: t("common.theme.light") },
    { value: "dark", label: t("common.theme.dark") },
  ];

  const backgroundRows = [
    {
      id: "dark-background",
      titleKey: "settings.background.dark.title",
      path: darkBackgroundPath,
      setPath: setDarkBackgroundPath,
    },
    {
      id: "light-background",
      titleKey: "settings.background.light.title",
      path: lightBackgroundPath,
      setPath: setLightBackgroundPath,
    },
  ] as const;

  const toggleRows = [
    {
      id: "hide-on-launch",
      titleKey: "settings.launch.hideOnLaunch.title",
      descriptionKey: `settings.launch.hideOnLaunch.description.${hideOnLaunch ? "on" : "off"}`,
      value: hideOnLaunch,
      onChange: setHideOnLaunch,
    },
    {
      id: "close-to-tray",
      titleKey: "settings.close.closeToTray.title",
      descriptionKey: `settings.close.closeToTray.description.${closeToTray ? "on" : "off"}`,
      value: closeToTray,
      onChange: setCloseToTray,
    },
    {
      id: "auto-start",
      titleKey: "settings.launch.autoStart.title",
      descriptionKey: `settings.launch.autoStart.description.${autoStart ? "on" : "off"}`,
      value: autoStart,
      onChange: setAutoStart,
    },
  ] as const;

  const transferRows = [
    {
      id: "export-byfen",
      operation: "export",
      titleKey: "settings.data.export.title",
      descriptionKey: "settings.data.export.description",
      actionKey: "settings.data.export.action",
      workingKey: "settings.data.export.working",
    },
    {
      id: "import-byfen",
      operation: "import",
      titleKey: "settings.data.import.title",
      descriptionKey: "settings.data.import.description",
      actionKey: "settings.data.import.action",
      workingKey: "settings.data.import.working",
    },
  ] as const;

  return [
    {
      id: "language",
      title: t("settings.language.title"),
      description:
        localeMode === "system"
          ? t("settings.language.description.system", {
              language: t(localeLabelKeys[locale]),
            })
          : t("settings.language.description.manual"),
      content: (
        <SegmentedControl
          options={languageOptions}
          value={localeMode}
          onChange={setLocaleMode}
        />
      ),
    },
    {
      id: "theme",
      title: t("settings.theme.title"),
      description:
        mode === "system"
          ? t("settings.theme.description.system", {
              mode: t(themeLabelKeys[resolvedMode]),
            })
          : t("settings.theme.description.manual"),
      content: (
        <SegmentedControl
          options={themeOptions}
          value={mode}
          onChange={setMode}
        />
      ),
    },
    {
      id: "tokens",
      title: t("settings.tokens.title"),
      description: t("settings.tokens.description"),
      content: (
        <button
          type="button"
          aria-expanded={isTokensExpanded}
          aria-label={t("settings.tokens.toggle")}
          title={t("settings.tokens.toggle")}
          onClick={() => setIsTokensExpanded((expanded) => !expanded)}
          className="qp-action-icon-button"
          style={{
            marginLeft: "auto",
            width: "2.4rem",
            height: "2.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isTokensExpanded ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
      ),
      expanded: isTokensExpanded,
      expandedContent: <TokenSettingsPanel />,
    },
    ...backgroundRows.map(({ id, titleKey, path, setPath }) => ({
      id,
      title: t(titleKey),
      description: path || t("settings.background.default"),
      content: (
        <BackgroundSelectButton
          onClick={() => void handleSelectBackground(setPath)}
        />
      ),
    })),
    {
      id: "next-launch-key",
      title: t("settings.launch.nextKey.title"),
      description: t("settings.launch.nextKey.description"),
      content: (
        <LaunchKeyButton
          launchKey={launchKey}
          onLaunchKeyChange={setLaunchKey}
        />
      ),
    },
    ...toggleRows.map(
      ({ id, titleKey, descriptionKey, value, onChange }) => ({
        id,
        title: t(titleKey),
        description: t(descriptionKey),
        content: (
          <SettingSwitch
            checked={value}
            onChange={onChange}
            label={t(titleKey)}
          />
        ),
      }),
    ),
    ...transferRows.map(
      ({
        id,
        operation,
        titleKey,
        descriptionKey,
        actionKey,
        workingKey,
      }) => ({
        id,
        title: t(titleKey),
        description: t(descriptionKey),
        content: (
          <DataTransferButton
            label={t(byfenOperation === operation ? workingKey : actionKey)}
            busy={byfenOperation === operation}
            disabled={byfenOperation !== null}
            onClick={() => void handleByfenOperation(operation)}
          />
        ),
      }),
    ),
    {
      id: "project-url",
      title: t("settings.project.title"),
      description: t("settings.project.description"),
      content: (
        <button
          type="button"
          className="qp-action-button"
          aria-label={t("settings.project.action")}
          title={projectUrl}
          onClick={() => void openFolder(projectUrl)}
          style={{
            minHeight: "2.2rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0 1rem",
            border: "none",
            borderRadius: "999rem",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          <span>{t("settings.project.action")}</span>
          <ExternalLink size={15} aria-hidden="true" />
        </button>
      ),
    },
  ];
}
