import { useEffect, useState } from "react";
import {
  updateGameField,
  type DetailFieldChangeHandler,
} from "../../api/UpdateGameField";
import { EnterHintInput } from "../ui/EnterHintInput";
import { showToast } from "../ui/Toast";
import { DetailRow } from "./DetailRow";

interface EditableGameFieldBase {
  label: string;
  savedMessage: string;
}

export type EditableGameFieldConfig =
  | (EditableGameFieldBase & {
      field: "name";
      initialValue: string;
      emptyMessage: string;
    })
  | (EditableGameFieldBase & {
      field: "developer";
      initialValue: string;
    })
  | (EditableGameFieldBase & {
      field: "score";
      initialValue: number;
      invalidMessage: string;
    })
  | (EditableGameFieldBase & {
      field: "publish_date";
      initialValue: number;
    });

type ParsedFieldValue =
  | { field: "name"; value: string }
  | { field: "developer"; value: string }
  | { field: "score"; value: number }
  | { field: "publish_date"; value: number };

interface EditableGameFieldProps {
  gameId: number;
  config: EditableGameFieldConfig;
  onSaved: DetailFieldChangeHandler;
}

const millisecondsPerSecond = 1000;

function formatDateValue(timestamp: number) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "";

  const timestampInMs =
    timestamp < 1_000_000_000_000
      ? timestamp * millisecondsPerSecond
      : timestamp;
  return new Date(timestampInMs).toISOString().slice(0, 10);
}

function formatDraft(config: EditableGameFieldConfig) {
  return config.field === "publish_date"
    ? formatDateValue(config.initialValue)
    : String(config.initialValue);
}

function parseDraft(
  config: EditableGameFieldConfig,
  draft: string,
): ParsedFieldValue | string | null {
  if (config.field === "name") {
    const value = draft.trim();
    return value ? { field: config.field, value } : config.emptyMessage;
  }

  if (config.field === "developer") {
    return { field: config.field, value: draft.trim() };
  }

  if (config.field === "score") {
    const value = Number(draft);
    return Number.isFinite(value) && value >= 0 && value <= 100
      ? { field: config.field, value }
      : config.invalidMessage;
  }

  const value = draft
    ? Date.parse(`${draft}T00:00:00Z`) / millisecondsPerSecond
    : 0;
  return Number.isSafeInteger(value) && value >= 0
    ? { field: config.field, value }
    : null;
}

async function persistFieldValue(
  gameId: number,
  parsed: ParsedFieldValue,
  onSaved: DetailFieldChangeHandler,
) {
  switch (parsed.field) {
    case "name":
    case "developer":
      await updateGameField(gameId, parsed.field, parsed.value);
      onSaved(parsed.field, parsed.value);
      return;
    case "score":
    case "publish_date":
      await updateGameField(gameId, parsed.field, parsed.value);
      onSaved(parsed.field, parsed.value);
  }
}

export function EditableGameField({
  gameId,
  config,
  onSaved,
}: EditableGameFieldProps) {
  const [draft, setDraft] = useState(() => formatDraft(config));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(formatDraft(config));
  }, [config.field, config.initialValue]);

  const handleSave = async () => {
    if (isSaving) return;

    const parsed = parseDraft(config, draft);
    if (typeof parsed === "string") {
      showToast(parsed, "error");
      return;
    }
    if (!parsed) return;

    if (parsed.value === config.initialValue) {
      setDraft(formatDraft(config));
      return;
    }

    try {
      setIsSaving(true);
      await persistFieldValue(gameId, parsed, onSaved);
      setDraft(
        parsed.field === "publish_date"
          ? formatDateValue(parsed.value)
          : String(parsed.value),
      );
      showToast(config.savedMessage, "success");
    } catch {
      return;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailRow label={config.label}>
      <EnterHintInput
        type={
          config.field === "publish_date"
            ? "date"
            : config.field === "score"
              ? "number"
              : "text"
        }
        min={config.field === "score" ? 0 : undefined}
        max={config.field === "score" ? 100 : undefined}
        step={config.field === "score" ? 0.1 : undefined}
        className="qp-form-input"
        value={draft}
        disabled={isSaving}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void handleSave();
          }
        }}
      />
    </DetailRow>
  );
}
