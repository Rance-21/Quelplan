import { ArrowLeft, ArrowRight, Check, CircleAlert, LoaderCircle, Plus, Search } from "lucide-react";
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
  const isDirect = flow.method === "steam" || flow.method === "app";
  const step = setup ? 0 : success ? 2 : 1;
  const steps = [t("add.flow.step.prepare"), t(isDirect ? "add.flow.step.import" : "add.flow.step.review"), t("add.flow.step.done")];
  const primaryLabel = flow.phase === "committing" ? t("add.status.committing") : success ? t("add.flow.toLibrary") : setup ?
    t(flow.method === "steam" ? "add.flow.steam.start" : flow.method === "app" ? "add.button.app" : flow.sourceMask === 0 ? "add.flow.local.start" : "add.flow.search") : t("add.action.confirm", { count: flow.selectionCount });

  return (
    <div className="qp-add-page qp-page-surface">
      <form className="qp-add-page-inner" onSubmit={event => { event.preventDefault(); if (setup) void flow.start(); else if (flow.phase === "review") void flow.confirm(); }}>
        <header className="qp-add-header">
          <div><span className="qp-page-kicker">QUELPLAN / LIBRARY</span><h1>{t("add.flow.title")}</h1><p>{t("add.flow.description")}</p></div>
          <ol className="qp-add-steps" aria-label={t("add.flow.steps")}>
            {steps.map((label, index) => <li className={`${step === index ? "is-current" : step > index ? "is-complete" : ""}`} key={label} aria-current={step === index ? "step" : undefined}>
              <span>{step > index ? <Check size="0.85rem" /> : index + 1}</span><strong>{label}</strong>
            </li>)}
          </ol>
        </header>

        {flow.error && <div className="qp-add-error" role="alert"><CircleAlert size="1.15rem" /><span>{flow.error}</span></div>}

        <div className={`qp-add-content${setup ? " is-setup" : ""}`}>
          {setup ? <AddSetup flow={flow} /> : flow.phase === "importing" || success ? <AddCompletion flow={flow} /> : <AddReview flow={flow} />}
        </div>

        <footer className="qp-add-footer">
          <button type="button" className="qp-add-button is-quiet" disabled={flow.isWorking} onClick={onBack}><ArrowLeft size="1rem" />{t("add.flow.toLibrary")}</button>
          <div className="qp-add-footer-end">
            <span className="qp-add-footer-hint" role="status">{flow.isWorking ? <><LoaderCircle size="1rem" className="qp-add-spinner" />{t(flow.isPicking ? "add.flow.picking" : "add.flow.keepOpen")}</> : setup ? t("add.flow.setup.hint") : success ? null : t("add.flow.selectionCount", { count: flow.selectionCount, total: flow.items.length })}</span>
            {!setup && flow.phase !== "importing" && <button type="button" className="qp-add-button" disabled={flow.isWorking} onClick={() => void flow.reset(success)}>
              {success && <Plus size="1rem" />}{t(success ? "add.flow.addMore" : "add.flow.reconfigure")}
            </button>}
            {flow.phase !== "importing" && flow.phase !== "searching" && <button type={success ? "button" : "submit"} className="qp-add-button is-primary"
              disabled={flow.isWorking || (setup ? !flow.canStart : !success && flow.selectionCount === 0)} onClick={success ? onBack : undefined}>
              {flow.phase === "committing" ? <LoaderCircle size="1rem" className="qp-add-spinner" /> : setup && !isDirect ? <Search size="1rem" /> : success ? <ArrowRight size="1rem" /> : <Check size="1rem" />}{primaryLabel}
            </button>}
          </div>
        </footer>
      </form>
    </div>
  );
}
