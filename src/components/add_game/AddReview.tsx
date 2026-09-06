import { Check, FileSearch, FolderSearch, LoaderCircle, SearchX, Star } from "lucide-react";
import type { AddGameFlow } from "../../hooks/useAddGameFlow";
import { getProgramName } from "../../lib/addGameFlow";
import { useI18n } from "../../lib/i18n";
import { formatSearchResultDate, formatSearchResultScore } from "../../utils/searchResultFormatting";
import { CandidateCover } from "./CandidateCover";

export function AddReview({ flow }: { flow: AddGameFlow }) {
  const { t, locale } = useI18n();
  const activeItem = flow.items.find(item => item.cacheIndex === flow.activeCacheIndex) ?? flow.items[0];
  const searching = flow.phase === "searching";

  if (flow.items.length === 0) {
    return (
      <section className="qp-add-panel qp-add-empty" role="status">
        <span className="qp-add-large-icon">{searching ? <FolderSearch size="2rem" strokeWidth={1.3} /> : <SearchX size="2rem" strokeWidth={1.3} />}</span>
        <h2>{t(searching ? "add.status.searching" : "add.status.noResults")}</h2>
        <p>{t(searching ? "add.flow.searching.hint" : "add.flow.empty.hint")}</p>
        {searching && <div className="qp-add-progress-track" aria-hidden="true"><span /></div>}
        <span className="qp-add-path" title={flow.path}>{flow.path}</span>
      </section>
    );
  }

  return (
    <div className="qp-add-review">
      <section className="qp-add-panel qp-add-programs" aria-label={t("add.flow.programs")}>
        <div className="qp-add-programs-heading"><h2>{t("add.flow.programs")}</h2><span className="qp-add-tag">{flow.items.length}</span></div>
        <div className="qp-add-program-list">
          {flow.items.map(item => {
            const selected = item.selectedIndex === null ? undefined : item.result.searched_games[item.selectedIndex];
            const label = selected?.name || getProgramName(item.result.path);
            return (
              <div className={`qp-add-program${activeItem.cacheIndex === item.cacheIndex ? " is-active" : ""}${!item.included ? " is-excluded" : ""}`} key={item.cacheIndex}>
                <input type="checkbox" checked={item.included} disabled={flow.isWorking || item.selectedIndex === null}
                  aria-label={t("add.flow.include", { name: label })} onChange={() => flow.toggleIncluded(item.cacheIndex)} />
                <button type="button" onClick={() => flow.setActiveCacheIndex(item.cacheIndex)} aria-current={activeItem.cacheIndex === item.cacheIndex ? "true" : undefined}>
                  <span className="qp-add-program-cover"><CandidateCover image={selected?.image ?? ""} name={label} /></span>
                  <span className="qp-add-program-copy"><strong title={label}>{label}</strong><small title={item.result.path}>{getProgramName(item.result.path)}</small>
                    <span>{t(item.included ? "add.flow.included" : "add.flow.excluded")}</span></span>
                </button>
              </div>
            );
          })}
        </div>
        <p className="qp-add-programs-note">{t("add.flow.programs.hint")}</p>
      </section>

      <section className="qp-add-panel qp-add-candidates-panel" aria-labelledby="qp-add-candidates-title">
        <header className="qp-add-candidates-heading">
          <div><h2 id="qp-add-candidates-title">{t("add.flow.candidates")}</h2><p>{t("add.flow.candidates.hint")}</p></div>
          <span className="qp-add-tag">{t("add.flow.candidateCount", { count: activeItem.result.searched_games.length })}</span>
          <div className="qp-add-active-path"><FileSearch size="1rem" /><span title={activeItem.result.path}>{activeItem.result.path}</span></div>
        </header>
        <div className="qp-add-candidates-scroll">
          {activeItem.result.searched_games.length === 0 ? (
            <div className="qp-add-empty"><SearchX size="2rem" /><p>{t("add.flow.noCandidates")}</p></div>
          ) : (
            <div className="qp-add-candidate-grid">
              {activeItem.result.searched_games.map((game, index) => {
                const isSelected = activeItem.selectedIndex === index;
                return (
                  <button key={`${activeItem.cacheIndex}-${index}`} type="button" className={`qp-add-candidate${isSelected ? " is-selected" : ""}`}
                    aria-pressed={isSelected} disabled={flow.isWorking} onClick={() => flow.selectCandidate(activeItem.cacheIndex, index)}>
                    <span className="qp-add-candidate-art"><CandidateCover image={game.image} name={game.name} />
                      {isSelected && <span className="qp-add-candidate-check"><Check size="0.9rem" />{t("add.flow.selected")}</span>}
                    </span>
                    <span className="qp-add-candidate-copy"><strong title={game.name}>{game.name}</strong>
                      <span className="qp-add-candidate-meta"><span><Star size="0.85rem" />{formatSearchResultScore(game.score)}</span><span>{formatSearchResultDate(game.publish_date, locale)}</span></span>
                      <small title={game.developer}>{game.developer || t("add.candidate.unknownDeveloper")}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {searching && <p className="qp-add-live-status" role="status"><LoaderCircle size="1rem" className="qp-add-spinner" />{t("add.flow.searching.count", { count: flow.items.length })}</p>}
      </section>
    </div>
  );
}
