import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Plus } from "lucide-react";
import type { AddGameFlow } from "../../hooks/useAddGameFlow";
import { useI18n } from "../../lib/i18n";
import { AddSetup } from "../../components/add_game/AddSetup";
import { AddReview } from "../../components/add_game/AddReview";
import { AddCompletion } from "../../components/add_game/AddCompletion";
import "./AddGamePage.css";

export default function AddGamePage({ flow, onBack }: { flow: AddGameFlow; onBack: () => void }) {
  const { t } = useI18n();
  const setup = flow.phase === "setup";
  const success = flow.phase === "success";
  const primaryLabel = flow.phase === "committing" ? t("add.status.committing") : success ? t("add.flow.toLibrary") : t("add.action.confirm", { count: flow.selectionCount });

  return (
    <div className="qp-add-page qp-page-surface">
      <form className="qp-add-page-inner" onSubmit={event => { event.preventDefault(); if (setup) void flow.start(); else if (flow.phase === "review") void flow.confirm(); }}>
        <header className="qp-add-header">
          <div><span className="qp-page-kicker">QUELPLAN / LIBRARY</span><h1>{t("add.flow.title")}</h1><p>{t("add.flow.description")}</p></div>
        </header>

        {flow.error && <div className="qp-add-error" role="alert"><CircleAlert size="1.15rem" /><span>{flow.error}</span></div>}

        <div className={`qp-add-content${setup ? " is-setup" : ""}`}>
          {setup ? <AddSetup flow={flow} /> : flow.phase === "importing" || success ? <AddCompletion flow={flow} /> : <AddReview flow={flow} />}
        </div>

        <footer className="qp-add-footer">
          <button type="button" className="qp-add-button is-quiet" disabled={flow.isWorking} onClick={onBack}><ArrowLeft size="1rem" />{t("add.flow.toLibrary")}</button>
          {!setup && <div className="qp-add-footer-end">
            <span className="qp-add-footer-hint" role="status">{flow.isWorking ? <><LoaderCircle size="1rem" className="qp-add-spinner" />{t("add.flow.keepOpen")}</> : success ? null : t("add.flow.selectionCount", { count: flow.selectionCount, total: flow.items.length })}</span>
            {flow.phase !== "importing" && <button type="button" className="qp-add-button" disabled={flow.isWorking} onClick={() => void flow.reset(success)}>
              {success && <Plus size="1rem" />}{t(success ? "add.flow.addMore" : "add.flow.reconfigure")}
            </button>}
            {flow.phase !== "importing" && flow.phase !== "searching" && <button type={success ? "button" : "submit"} className="qp-add-button is-primary"
              disabled={flow.isWorking || (!success && flow.selectionCount === 0)} onClick={success ? onBack : undefined}>
              {flow.phase === "committing" ? <LoaderCircle size="1rem" className="qp-add-spinner" /> : success ? <ArrowRight size="1rem" /> : <Check size="1rem" />}{primaryLabel}
            </button>}
          </div>}
        </footer>
      </form>
    </div>
  );
}
