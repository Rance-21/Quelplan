import type { DataSourceKey, DataSourceSelection } from "../../api/Add";
import { WindowPanelHeader } from "../ui/WindowPanelHeader";
import { AddButton } from "./AddGameButton";
import { BatchAddButton } from "./BatchAddButton";
import { AddModeSelector, type AddMode } from "./AddModeSelector";
import { DataSourceSelector } from "./DataSourceSelector";
import { SteamAddButton } from "./SteamAddButton";
import { useI18n } from "../../lib/i18n";

interface AddSetupPanelProps {
  addMode: AddMode;
  sources: DataSourceSelection;
  onAddModeChange: (mode: AddMode) => void;
  onSourceChange: (source: DataSourceKey, enabled: boolean) => void;
  onPathSelected: (path: string, mode: AddMode) => Promise<void>;
  onDirectorySelected: (path: string) => Promise<void>;
  onSteamImport: () => Promise<void>;
}

export function AddSetupPanel({
  addMode,
  sources,
  onAddModeChange,
  onSourceChange,
  onPathSelected,
  onDirectorySelected,
  onSteamImport,
}: AddSetupPanelProps) {
  const { t } = useI18n();

  return (
    <section
      className="qp-window-panel"
      style={{
        width: "min(86%, 36rem)",
        padding: "1.4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <WindowPanelHeader
        title={t("add.page.title")}
        description={t("add.page.description")}
      />

      <AddModeSelector addMode={addMode} onAddModeChange={onAddModeChange} />

      <DataSourceSelector
        sources={sources}
        disabled={addMode === "app"}
        onSourceChange={onSourceChange}
      />

      <div style={{ width: "100%", display: "flex", gap: "0.7rem" }}>
        <AddButton addMode={addMode} onPathSelected={onPathSelected} />
        <BatchAddButton
          addMode={addMode}
          onDirectorySelected={onDirectorySelected}
        />
        <SteamAddButton addMode={addMode} onSteamImport={onSteamImport} />
      </div>
    </section>
  );
}
