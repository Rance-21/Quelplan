import { AppWindow, Check, ChevronRight, FolderOpen, Gamepad2, Library, MonitorDown, Search } from "lucide-react";
import type { AddGameFlow } from "../../hooks/useAddGameFlow";
import type { AddMethod } from "../../lib/addGameFlow";
import { getProgramName } from "../../lib/addGameFlow";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import type { DataSourceKey } from "../../api/Add";

const methods: { id: AddMethod; icon: typeof Gamepad2; title: TranslationKey }[] = [
  { id: "single", icon: Gamepad2, title: "add.flow.single" },
  { id: "batch", icon: FolderOpen, title: "add.flow.batch" },
  { id: "steam", icon: MonitorDown, title: "add.flow.steam" },
  { id: "app", icon: AppWindow, title: "add.flow.app" },
];

const sourceOptions: { id: DataSourceKey; name: string }[] = [
  { id: "bgm", name: "Bangumi" },
  { id: "vndb", name: "VNDB" },
  { id: "igdb", name: "IGDB" },
];

export function AddSetup({ flow }: { flow: AddGameFlow }) {
  const { t } = useI18n();
  const isSearch = flow.method === "single" || flow.method === "batch";
  const isBatch = flow.method === "batch";
  const isApp = flow.method === "app";
  const startLabel = t(flow.method === "steam" ? "add.flow.steam.start" : isApp ? "add.button.app" : flow.sourceMask === 0 ? "add.flow.local.start" : "add.flow.search");

  return (
    <div className="qp-add-setup">
      <div className="qp-add-methods" role="group" aria-label={t("add.flow.method")}>
        {methods.map(({ id, icon: Icon, title }) => (
          <button key={id} type="button" className={`qp-add-method${flow.method === id ? " is-selected" : ""}`}
            aria-pressed={flow.method === id} disabled={flow.isWorking} onClick={() => flow.changeMethod(id)}>
            <span className="qp-add-method-top"><Icon size="1.3rem" strokeWidth={1.6} aria-hidden="true" />
              {flow.method === id && <Check size="1rem" aria-hidden="true" />}
            </span>
            <strong>{t(title)}</strong>
          </button>
        ))}
      </div>

      <div className="qp-add-setup-columns">
        <section className="qp-add-panel qp-add-file-panel" aria-labelledby="qp-add-file-title">
          <div className="qp-add-section-heading">
            <h2 id="qp-add-file-title">{t(flow.method === "steam" ? "add.flow.steam.library" : isBatch ? "add.flow.directory" : "add.flow.program")}</h2>
          </div>
          {flow.method === "steam" ? (
            <div className="qp-add-steam-intro">
              <span className="qp-add-large-icon"><MonitorDown size="2rem" strokeWidth={1.3} /></span>
              <h3>{t("add.flow.steam.ready")}</h3>
            </div>
          ) : (
            <>
              <button type="button" className={`qp-add-file-picker${flow.path ? " has-file" : ""}`} onClick={() => void flow.pickPath()} disabled={flow.isWorking}>
                <span className="qp-add-file-icon">{isBatch ? <FolderOpen size="1.7rem" strokeWidth={1.4} /> : <AppWindow size="1.7rem" strokeWidth={1.4} />}</span>
                <span className="qp-add-file-copy">
                  <strong>{flow.path ? getProgramName(flow.path) : t(isBatch ? "add.flow.chooseDirectory" : "add.flow.chooseProgram")}</strong>
                  {flow.path && <span title={flow.path}>{flow.path}</span>}
                </span>
                {flow.isPicking ? <span className="qp-add-muted">{t("add.flow.picking")}</span> : <ChevronRight size="1.1rem" />}
              </button>
              {flow.method === "single" && (
                <div className="qp-add-name-field">
                  <label htmlFor="qp-add-game-name">{t("add.name.label")}</label>
                  <div className="qp-add-name-input">
                    <input id="qp-add-game-name" className="qp-form-input" name="gameName" value={flow.name} disabled={flow.isWorking || !flow.path}
                      onChange={event => flow.changeName(event.target.value)} placeholder={t("add.name.placeholder")} autoComplete="off" />
                    <button type="submit" className="qp-add-button is-primary qp-add-name-submit" disabled={!flow.canStart} aria-label={startLabel} title={startLabel}>
                      <Search size="1rem" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {flow.method !== "single" && (
            <div className="qp-add-setup-action">
              <button type="submit" className="qp-add-button is-primary" disabled={!flow.canStart}>
                {isSearch ? <Search size="1rem" aria-hidden="true" /> : <Check size="1rem" aria-hidden="true" />}{startLabel}
              </button>
            </div>
          )}
        </section>

        <section className="qp-add-panel qp-add-source-panel" aria-labelledby="qp-add-source-title">
          <div className="qp-add-section-heading">
            <h2 id="qp-add-source-title">{t(isSearch ? "add.flow.sources" : "add.flow.next")}</h2>
          </div>
          {isSearch ? (
            <>
              <div className="qp-add-sources">
                {sourceOptions.map(({ id, name }) => (
                  <label className={`qp-add-source${flow.sources[id] ? " is-selected" : ""}`} key={id}>
                    <strong>{name}</strong>
                    <input type="checkbox" checked={flow.sources[id]} disabled={flow.isWorking}
                      onChange={event => flow.changeSource(id, event.target.checked)} aria-label={name} />
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="qp-add-next-note">
              <Library size="1.6rem" strokeWidth={1.4} />
              <h3>{t(isApp ? "add.flow.app.destination" : "add.flow.steam.destination")}</h3>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
