import { useI18n } from "../../lib/i18n";
import type { AddMode } from "./AddModeSelector";

interface SteamAddButtonProps {
  addMode: AddMode;
  onSteamImport: () => Promise<void> | void;
}

export function SteamAddButton({
  addMode,
  onSteamImport,
}: SteamAddButtonProps) {
  const { t } = useI18n();
  const disabled = addMode !== "game";

  const handleSteamAdd = async () => {
    if (disabled) return;

    await onSteamImport();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void handleSteamAdd()}
      className="qp-action-button qp-add-action-button"
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {t("add.button.steamGames")}
    </button>
  );
}
