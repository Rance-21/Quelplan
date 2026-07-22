import { selectDirectory } from "../../api/Dialog";
import { useI18n } from "../../lib/i18n";
import type { AddMode } from "./AddModeSelector";

interface BatchAddButtonProps {
  addMode: AddMode;
  onDirectorySelected: (path: string) => Promise<void> | void;
}

export function BatchAddButton({
  addMode,
  onDirectorySelected,
}: BatchAddButtonProps) {
  const { t } = useI18n();
  const disabled = addMode !== "game";

  const handleBatchAdd = async () => {
    if (disabled) return;

    const selectedDirectory = await selectDirectory();
    if (!selectedDirectory) return;

    await onDirectorySelected(selectedDirectory);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => void handleBatchAdd()}
      className="qp-action-button qp-add-action-button"
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {t("add.button.batchGames")}
    </button>
  );
}
