import { AppWindow, Gamepad2 } from "lucide-react";
import { useI18n } from "../../lib/i18n";

export type AddMode = "game" | "app";

interface AddModeSelectorProps {
  addMode: AddMode;
  onAddModeChange: (addMode: AddMode) => void;
}

export function AddModeSelector({
  addMode,
  onAddModeChange,
}: AddModeSelectorProps) {
  const { t } = useI18n();
  const addModeOptions = [
    { id: "game" as const, label: t("common.mode.game"), icon: Gamepad2 },
    { id: "app" as const, label: t("common.mode.app"), icon: AppWindow },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "0.7rem",
      }}
    >
      {addModeOptions.map((addModeOption) => {
        const Icon = addModeOption.icon;
        const isSelected = addMode === addModeOption.id;

        return (
          <button
            key={addModeOption.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onAddModeChange(addModeOption.id)}
            className={`qp-add-option-choice${isSelected ? " is-selected" : ""}`}
          >
            <Icon size={17} strokeWidth={1.7} />
            {addModeOption.label}
          </button>
        );
      })}
    </div>
  );
}
