import { Check, Library, LoaderCircle, MonitorDown } from "lucide-react";
import type { AddGameFlow } from "../../hooks/useAddGameFlow";
import { useI18n } from "../../lib/i18n";
import { CandidateCover } from "./CandidateCover";

export function AddCompletion({ flow }: { flow: AddGameFlow }) {
  const { t } = useI18n();
  const importing = flow.phase === "importing";
  const isApp = flow.method === "app";
  return (
    <section className="qp-add-panel qp-add-completion" aria-live="polite">
      <span className="qp-add-large-icon">{importing ? <MonitorDown size="2rem" strokeWidth={1.3} /> : flow.completedCount > 0 ? <Check size="2rem" strokeWidth={1.6} /> : <Library size="2rem" strokeWidth={1.3} />}</span>
      <h2>{t(importing ? isApp ? "add.status.appAdding" : "add.flow.steam.importing" : flow.completedCount === 0 ? "add.flow.steam.empty" : "add.flow.success")}</h2>
      <p>{t(importing ? isApp ? "add.flow.app.progress" : "add.flow.steam.progress" : isApp ? "add.flow.app.success" : flow.completedCount === 0 ? "add.flow.steam.emptyHint" : "add.flow.success.description", { count: importing ? flow.importedGames.length : flow.completedCount })}</p>
      {importing && <div className="qp-add-progress-track" aria-hidden="true"><span /></div>}
      {flow.importedGames.length > 0 && (
        <div className="qp-add-import-list">
          {flow.importedGames.map(game => <div className="qp-add-import-item" key={game.id}>
            <span className="qp-add-import-cover"><CandidateCover image={game.coverUrl} name={game.name} /></span><strong>{game.name}</strong><Check size="1rem" />
          </div>)}
        </div>
      )}
      {importing && <span className="qp-add-muted qp-add-inline-status"><LoaderCircle size="1rem" className="qp-add-spinner" />{t("add.flow.keepOpen")}</span>}
    </section>
  );
}
