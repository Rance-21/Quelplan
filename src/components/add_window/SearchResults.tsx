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
    <div className="qp-search-results no-scrollbar">
      {items.map(({ result, selectedIndex }, outsideIndex) => {
        const selectedGame = result.searched_games[selectedIndex];
        const isExpanded = expandedIndex === outsideIndex;

        return (
          <div className="qp-search-result" key={`${outsideIndex}-${result.path}`}>
            <div className="qp-search-result-row">
              <button
                type="button"
                className="qp-search-result-main"
                aria-expanded={isExpanded}
                disabled={disabled}
                onClick={() =>
                  onExpandedIndexChange(isExpanded ? null : outsideIndex)
                }
              >
                <div className="qp-search-result-cover">
                  <CandidateCover
                    image={selectedGame.image}
                    name={selectedGame.name}
                  />
                </div>

                <div className="qp-search-result-content">
                  <span className="qp-search-result-path">
                    {result.path}
                  </span>
                  <strong
                    className="qp-search-result-title"
                    title={selectedGame.name}
                  >
                    {selectedGame.name}
                  </strong>
                  <CandidateMetrics game={selectedGame} />
                </div>

                <ChevronDown
                  className={`qp-search-result-chevron${isExpanded ? " is-expanded" : ""}`}
                  size={20}
                  strokeWidth={1.8}
                />
              </button>

              <button
                type="button"
                className="qp-search-result-delete"
                aria-label={t("add.action.removeResult")}
                title={t("add.action.removeResult")}
                disabled={disabled}
                onClick={() => onResultDelete(outsideIndex)}
              >
                <Trash2 size={18} strokeWidth={1.7} />
              </button>
            </div>

            <div
              className={`qp-search-candidates${isExpanded ? " is-expanded" : ""}`}
              aria-hidden={!isExpanded}
              inert={!isExpanded}
            >
              <div className="qp-search-candidate-list">
                {isExpanded &&
                  result.searched_games.map((game, insideIndex) => (
                    <button
                      type="button"
                      className={`qp-search-candidate-card${
                        insideIndex === selectedIndex ? " is-selected" : ""
                      }`}
                      aria-pressed={insideIndex === selectedIndex}
                      disabled={disabled}
                      key={`${insideIndex}-${game.name}`}
                      onClick={() =>
                        onCandidateSelect(outsideIndex, insideIndex)
                      }
                    >
                      <div className="qp-search-candidate-cover">
                        <CandidateCover image={game.image} name={game.name} />
                      </div>
                      <strong className="qp-search-candidate-name" title={game.name}>
                        {game.name}
                      </strong>
                      <span className="qp-search-candidate-score">
                        {t("detail.metrics.score")}{" "}
                        {formatSearchResultScore(game.score)}
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
