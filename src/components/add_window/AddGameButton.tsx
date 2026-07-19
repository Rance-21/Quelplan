import { useState } from "react";
import { selectSingleFile } from "../../api/Dialog";
import { useI18n } from "../../lib/i18n";
import type { AddMode } from "./AddModeSelector";

interface AddButtonProps {
  addMode: AddMode;
  onPathSelected: (path: string, addMode: AddMode) => Promise<void> | void;
}

export function AddButton({
  addMode,
  onPathSelected,
}: AddButtonProps) {
  const { t } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const isGameMode = addMode === "game";

  const handleAdd = async () => {
    if (isAdding) return;

    const selectedPath = await selectSingleFile({
      filterName: isGameMode
        ? t("add.fileFilter.game")
        : t("add.fileFilter.app"),
      extensions: ["exe"],
    });
    if (!selectedPath) return;

    try {
      setIsAdding(true);
      await onPathSelected(selectedPath, addMode);
    } catch {
      return;
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isAdding}
      onClick={() => void handleAdd()}
      className="qp-action-button qp-add-action-button"
      style={{ cursor: isAdding ? "wait" : "pointer" }}
    >
      {isGameMode ? t("add.button.game") : t("add.button.app")}
    </button>
  );
}
