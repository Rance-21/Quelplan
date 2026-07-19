import { FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { selectSingleFile } from "../../api/Dialog";
import { updateGameField } from "../../api/UpdateGameField";
import { showToast } from "../ui/Toast";
import { DetailRow } from "./DetailRow";

interface EditablePathFieldProps {
  gameId: number;
  initialPath: string;
  field: "exe_path" | "cover";
  label: string;
  selectLabel: string;
  filterName: string;
  extensions: string[];
  emptyMessage: string;
  savedMessage: string;
  onSaved: (oldPath: string, newPath: string) => void;
}

export function EditablePathField({
  gameId,
  initialPath,
  field,
  label,
  selectLabel,
  filterName,
  extensions,
  emptyMessage,
  savedMessage,
  onSaved,
}: EditablePathFieldProps) {
  const [path, setPath] = useState(initialPath || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPath(initialPath || "");
  }, [initialPath]);

  const savePath = async (nextPath: string) => {
    if (isSaving) return;

    const normalizedPath = nextPath.trim();
    if (!normalizedPath) {
      showToast(emptyMessage, "error");
      return;
    }

    if (normalizedPath === initialPath) {
      setPath(normalizedPath);
      return;
    }

    try {
      setIsSaving(true);
      await updateGameField(gameId, field, normalizedPath);
      setPath(normalizedPath);
      onSaved(initialPath, normalizedPath);
      showToast(savedMessage, "success");
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelect = async () => {
    const selected = await selectSingleFile({ filterName, extensions });
    if (!selected) return;

    setPath(selected);
    await savePath(selected);
  };

  return (
    <DetailRow label={label}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
        }}
      >
        <input
          type="text"
          className="qp-form-input"
          value={path}
          disabled={isSaving}
          onChange={(event) => setPath(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void savePath(path);
            }
          }}
        />

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSelect()}
          className="qp-action-icon-button"
          aria-label={selectLabel}
          title={selectLabel}
          style={{
            width: "2.6rem",
            height: "2.6rem",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.8rem",
            border: "none",
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          <FolderOpen size={18} strokeWidth={1.8} />
        </button>
      </div>
    </DetailRow>
  );
}
