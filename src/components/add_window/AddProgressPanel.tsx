import { SearchX } from "lucide-react";
import type {
  AddPhase,
  AddSearchItem,
} from "../../hooks/useAddWindow";
import { useI18n } from "../../lib/i18n";
import { SearchResults } from "./SearchResults";

interface AddProgressPanelProps {
  phase: AddPhase;
  searchItems: AddSearchItem[];
  expandedIndex: number | null;
  isCancelling: boolean;
  selectionCount: number;
  onExpandedIndexChange: (index: number | null) => void;
  onCandidateSelect: (outsideIndex: number, insideIndex: number) => void;
  onResultDelete: (displayIndex: number) => void;
  onCancel: () => Promise<void>;
  onConfirm: () => Promise<void>;
}

export function AddProgressPanel({
  phase,
  searchItems,
  expandedIndex,
  isCancelling,
  selectionCount,
  onExpandedIndexChange,
  onCandidateSelect,
  onResultDelete,
  onCancel,
  onConfirm,
}: AddProgressPanelProps) {
  const { t } = useI18n();

  if (phase === "steam-importing") return null;

  const isSearchPhase =
    phase === "searching" || phase === "review" || phase === "committing";

  if (!isSearchPhase) {
    return (
      <div
        style={{
          minHeight: 0,
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.8rem",
          color: "var(--qp-muted-text)",
        }}
      >
        <strong style={{ color: "var(--qp-text)", fontSize: "1rem" }}>
          {t("add.status.appAdding")}
        </strong>
      </div>
    );
  }

  const title =
    phase === "searching"
      ? t("add.status.searching")
      : phase === "committing"
        ? t("add.status.committing")
        : t("add.status.review");

  return (
    <div
      style={{
        width: "min(88%, 54rem)",
        minWidth: 0,
        minHeight: 0,
        margin: "0 auto",
        padding: "0.85rem 0 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "3.4rem",
          padding: "0 0.25rem",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.15rem", lineHeight: 1.3 }}>
            {title}
          </h2>
          <span style={{ color: "var(--qp-muted-text)", fontSize: "0.84rem" }}>
            {t("add.status.resultCount", { count: searchItems.length })}
          </span>
        </div>
      </div>

      {searchItems.length > 0 ? (
        <SearchResults
          items={searchItems}
          expandedIndex={expandedIndex}
          disabled={phase !== "review" || isCancelling}
          onExpandedIndexChange={onExpandedIndexChange}
          onCandidateSelect={onCandidateSelect}
          onResultDelete={onResultDelete}
        />
      ) : (
        <div
          style={{
            minHeight: 0,
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8rem",
            color: "var(--qp-muted-text)",
          }}
        >
          {phase !== "searching" && <SearchX size={38} strokeWidth={1.4} />}
          <span>
            {phase === "searching"
              ? t("add.status.waitingForResults")
              : t("add.status.noResults")}
          </span>
        </div>
      )}

      {(phase === "review" || phase === "committing") && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            paddingTop: "0.15rem",
          }}
        >
          <button
            type="button"
            className="qp-action-button qp-add-footer-button"
            style={{
              minWidth: "8rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "62rem",
              fontSize: "0.92rem",
              fontWeight: 700,
            }}
            disabled={phase !== "review" || isCancelling}
            onClick={() => void onCancel()}
          >
            {t("add.action.cancel")}
          </button>
          <button
            type="button"
            className="qp-action-button qp-add-footer-button is-primary"
            style={{
              minWidth: "8rem",
              padding: "0.65rem 1.2rem",
              borderRadius: "62rem",
              fontSize: "0.92rem",
              fontWeight: 700,
            }}
            disabled={phase !== "review" || selectionCount === 0}
            onClick={() => void onConfirm()}
          >
            {phase === "committing"
              ? t("add.status.committing")
              : t("add.action.confirm", { count: selectionCount })}
          </button>
        </div>
      )}
    </div>
  );
}
