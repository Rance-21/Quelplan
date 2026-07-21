import { ChevronDown, Trash2 } from "lucide-react";
import type { AddSearchItem } from "../../hooks/useAddWindow";
import { useI18n } from "../../lib/i18n";
import { formatSearchResultScore } from "../../utils/searchResultFormatting";
import { CandidateCover, CandidateMetrics } from "./SearchResultParts";

interface SearchResultsProps {
  items: AddSearchItem[];
  expandedIndex: number | null;
  disabled: boolean;
  onExpandedIndexChange: (index: number | null) => void;
  onCandidateSelect: (outsideIndex: number, insideIndex: number) => void;
  onResultDelete: (outsideIndex: number) => void;
}

export function SearchResults({
  items,
  expandedIndex,
  disabled,
  onExpandedIndexChange,
  onCandidateSelect,
  onResultDelete,
}: SearchResultsProps) {
  const { t } = useI18n();

  return (
    <div
      className="no-scrollbar"
      style={{
        minHeight: 0,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: "0.65rem",
        overflowY: "auto",
        padding: "0.1rem 0.2rem 0.55rem",
      }}
    >
      {items.map(({ result, selectedIndex }, outsideIndex) => {
        const selectedGame = result.searched_games[selectedIndex];
        const isExpanded = expandedIndex === outsideIndex;

        if (!selectedGame) return null;

        return (
          <div
            key={`${outsideIndex}-${result.path}`}
            style={{ flexShrink: 0, minWidth: 0 }}
          >
            <div
              className="qp-search-result-row"
              style={{
                width: "100%",
                minWidth: 0,
                minHeight: "5.25rem",
                display: "flex",
                alignItems: "center",
                padding: 0,
                border: "1px solid var(--qp-panel-border)",
                borderRadius: "1rem",
                background: "var(--qp-panel-bg)",
                boxShadow: "var(--qp-panel-shadow)",
                transition: "opacity 0.12s ease",
              }}
            >
              <button
                type="button"
                className="qp-search-result-main"
                aria-expanded={isExpanded}
                disabled={disabled}
                style={{
                  minWidth: 0,
                  minHeight: "5.25rem",
                  padding: "0.55rem 0.4rem 0.55rem 0.7rem",
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                  gap: "0.75rem",
                  border: "none",
                  background: "transparent",
                  color: "var(--qp-text)",
                  textAlign: "left",
                  opacity: disabled ? 0.7 : 1,
                }}
                onClick={() =>
                  onExpandedIndexChange(isExpanded ? null : outsideIndex)
                }
              >
                <div
                  style={{
                    width: "3rem",
                    height: "4rem",
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: "0.62rem",
                    background: "var(--qp-input-bg)",
                  }}
                >
                  <CandidateCover
                    image={selectedGame.image}
                    name={selectedGame.name}
                  />
                </div>

                <div
                  style={{
                    minWidth: 0,
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  <span
                    style={{
                      color: "var(--qp-muted-text)",
                      fontSize: "0.78rem",
                      lineHeight: 1.3,
                      overflowWrap: "anywhere",
                      whiteSpace: "normal",
                    }}
                  >
                    {result.path}
                  </span>
                  <strong
                    title={selectedGame.name}
                    style={{
                      overflow: "hidden",
                      fontSize: "1rem",
                      lineHeight: 1.25,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedGame.name}
                  </strong>
                  <CandidateMetrics game={selectedGame} />
                </div>

                <ChevronDown
                  className="qp-search-result-chevron"
                  size={20}
                  strokeWidth={1.8}
                  style={{
                    flexShrink: 0,
                    color: "var(--qp-muted-text)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.12s ease",
                  }}
                />
              </button>

              <button
                type="button"
                className="qp-search-result-delete"
                aria-label={t("add.action.removeResult")}
                title={t("add.action.removeResult")}
                disabled={disabled}
                onClick={() => onResultDelete(outsideIndex)}
                style={{
                  width: "2.65rem",
                  height: "2.65rem",
                  marginRight: "0.55rem",
                  display: "flex",
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "0.75rem",
                  opacity: disabled ? 0.7 : 1,
                  transition:
                    "background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease, opacity 0.12s ease",
                }}
              >
                <Trash2 size={18} strokeWidth={1.7} />
              </button>
            </div>

            <div
              className={`qp-search-candidates${isExpanded ? " is-expanded" : ""}`}
              aria-hidden={!isExpanded}
              inert={!isExpanded}
              style={{
                display: "grid",
                gridTemplateRows: isExpanded ? "1fr" : "0fr",
                opacity: isExpanded ? 1 : 0,
                transition:
                  "grid-template-rows 0.12s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.12s ease",
              }}
            >
              <div
                style={{
                  minHeight: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  alignContent: "flex-start",
                  gap: "0.65rem",
                  overflow: "hidden",
                  padding: isExpanded ? "0.65rem 0.15rem 0.15rem" : undefined,
                }}
              >
                {result.searched_games.map((game, insideIndex) => (
                  <button
                    type="button"
                    className={`qp-search-candidate-card${
                      insideIndex === selectedIndex ? " is-selected" : ""
                    }`}
                    aria-pressed={insideIndex === selectedIndex}
                    disabled={disabled}
                    key={`${insideIndex}-${game.name}`}
                    onClick={() => onCandidateSelect(outsideIndex, insideIndex)}
                    style={{
                      width: "9rem",
                      minWidth: 0,
                      maxWidth: "100%",
                      flex: "0 1 9rem",
                      padding: "0.55rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: "0.35rem",
                      borderColor:
                        insideIndex === selectedIndex
                          ? "var(--qp-input-focus)"
                          : undefined,
                      background:
                        insideIndex === selectedIndex
                          ? "var(--qp-panel-hover)"
                          : undefined,
                      boxShadow:
                        insideIndex === selectedIndex
                          ? "0 0 0 2px color-mix(in srgb, var(--qp-input-focus) 12%, transparent)"
                          : undefined,
                      borderRadius: "0.85rem",
                      color: "var(--qp-text)",
                      textAlign: "left",
                      transition:
                        "background-color 0.12s ease, border-color 0.12s ease, transform 0.12s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "7.2rem",
                        overflow: "hidden",
                        borderRadius: "0.6rem",
                        background: "var(--qp-control-muted)",
                      }}
                    >
                      <CandidateCover image={game.image} name={game.name} />
                    </div>
                    <strong
                      title={game.name}
                      style={{
                        overflow: "hidden",
                        fontSize: "0.82rem",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {game.name}
                    </strong>
                    <span
                      style={{
                        overflow: "hidden",
                        color: "var(--qp-muted-text)",
                        fontSize: "0.74rem",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("detail.metrics.score")} {formatSearchResultScore(game.score)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
