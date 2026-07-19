import type { KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { EnterHintInput } from "../ui/EnterHintInput";

export interface SearchBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchBox({
  value,
  onValueChange,
  onSearch,
}: SearchBoxProps) {
  const { t } = useI18n();
  const placeholder = t("folder.search.placeholder");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    onSearch();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "24rem",
        padding: "0.2rem 0.4rem 0.2rem 1rem",
        borderRadius: "625rem",
        border: "0.2rem solid var(--qp-border-soft)",
        backgroundColor: "var(--qp-surface)",
      }}
      data-tauri-drag-region="false"
    >
      <Search
        size={18}
        color="var(--qp-text)"
        style={{ marginRight: "0.625rem" }}
      />

      <EnterHintInput
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          fontSize: "1rem",
          color: "var(--qp-text)",
          outline: "none",
          border: "none",
          background: "transparent",
        }}
      />
    </div>
  );
}
