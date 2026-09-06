import { AppWindow, Check, ChevronRight, FolderOpen, Gamepad2, HardDrive, Library, MonitorDown } from "lucide-react";
import type { AddGameFlow } from "../../hooks/useAddGameFlow";
import type { AddMethod } from "../../lib/addGameFlow";
import { getProgramName } from "../../lib/addGameFlow";
import { useI18n, type TranslationKey } from "../../lib/i18n";
import type { DataSourceKey } from "../../api/Add";

const methods: { id: AddMethod; icon: typeof Gamepad2; title: TranslationKey; description: TranslationKey }[] = [
  { id: "single", icon: Gamepad2, title: "add.flow.single", description: "add.flow.single.description" },
  { id: "batch", icon: FolderOpen, title: "add.flow.batch", description: "add.flow.batch.description" },
  { id: "steam", icon: MonitorDown, title: "add.flow.steam", description: "add.flow.steam.description" },
  { id: "app", icon: AppWindow, title: "add.flow.app", description: "add.flow.app.description" },
];

const sourceOptions: { id: DataSourceKey; name: string; description: TranslationKey }[] = [
  { id: "bgm", name: "Bangumi", description: "add.flow.source.bgm" },
  { id: "vndb", name: "VNDB", description: "add.flow.source.vndb" },
  { id: "igdb", name: "IGDB", description: "add.flow.source.igdb" },
];

export function AddSetup({ flow }: { flow: AddGameFlow }) {
  const { t } = useI18n();
  const isSearch = flow.method === "single" || flow.method === "batch";
  const isBatch = flow.method === "batch";
  const isApp = flow.method === "app";

  return (
    <div className="qp-add-setup">
      <div className="qp-add-methods" role="group" aria-label={t("add.flow.method")}>
        {methods.map(({ id, icon: Icon, title, description }) => (
          <button key={id} type="button" className={`qp-add-method${flow.method === id ? " is-selected" : ""}`}
            aria-pressed={flow.method === id} disabled={flow.isWorking} onClick={() => flow.changeMethod(id)}>
            <span className="qp-add-method-top"><Icon size="1.3rem" strokeWidth={1.6} aria-hidden="true" />
              {flow.method === id && <Check size="1rem" aria-hidden="true" />}
            </span>
            <strong>{t(title)}</strong><span>{t(description)}</span>
          </button>
        ))}
      </div>

      <div className="qp-add-setup-columns">
        <section className="qp-add-panel qp-add-file-panel" aria-labelledby="qp-add-file-title">
          <div className="qp-add-section-heading">
            <h2 id="qp-add-file-title">{t(flow.method === "steam" ? "add.flow.steam.library" : isBatch ? "add.flow.directory" : "add.flow.program")}</h2>
            <p>{t(flow.method === "steam" ? "add.flow.steam.hint" : isBatch ? "add.flow.directory.hint" : isApp ? "add.flow.app.hint" : "add.flow.program.hint")}</p>
          </div>
          {flow.method === "steam" ? (
            <div className="qp-add-steam-intro">
              <span className="qp-add-large-icon"><MonitorDown size="2rem" strokeWidth={1.3} /></span>
              <h3>{t("add.flow.steam.ready")}</h3>
              <p>{t("add.flow.steam.direct")}</p>
              <span className="qp-add-tag"><HardDrive size="0.9rem" />{t("add.flow.steam.local")}</span>
            </div>
          ) : (
            <>
              <button type="button" className={`qp-add-file-picker${flow.path ? " has-file" : ""}`} onClick={() => void flow.pickPath()} disabled={flow.isWorking}>
                <span className="qp-add-file-icon">{isBatch ? <FolderOpen size="1.7rem" strokeWidth={1.4} /> : <AppWindow size="1.7rem" strokeWidth={1.4} />}</span>
                <span className="qp-add-file-copy">
                  <strong>{flow.path ? getProgramName(flow.path) : t(isBatch ? "add.flow.chooseDirectory" : "add.flow.chooseProgram")}</strong>
                  <span title={flow.path}>{flow.path || t(isBatch ? "add.flow.chooseDirectory.hint" : "add.flow.chooseProgram.hint")}</span>
                </span>
                {flow.isPicking ? <span className="qp-add-muted">{t("add.flow.picking")}</span> : <ChevronRight size="1.1rem" />}
              </button>
              {flow.method === "single" && (
                <div className="qp-add-name-field">
                  <label htmlFor="qp-add-game-name">{t("add.name.label")}</label>
                  <input id="qp-add-game-name" className="qp-form-input" name="gameName" value={flow.name} disabled={flow.isWorking || !flow.path}
                    onChange={event => flow.changeName(event.target.value)} placeholder={t("add.name.placeholder")} autoComplete="off" aria-describedby="qp-add-name-hint" />
                  <small id="qp-add-name-hint">{t("add.name.description")}</small>
                </div>
              )}
              {isBatch && <p className="qp-add-file-note">{t("add.flow.batch.note")}</p>}
              {isApp && <p className="qp-add-file-note">{t("add.flow.app.note")}</p>}
            </>
          )}
        </section>

        <section className="qp-add-panel qp-add-source-panel" aria-labelledby="qp-add-source-title">
          <div className="qp-add-section-heading">
            <h2 id="qp-add-source-title">{t(isSearch ? "add.flow.sources" : "add.flow.next")}</h2>
            <p>{t(isSearch ? "add.flow.sources.hint" : "add.flow.next.hint")}</p>
          </div>
          {isSearch ? (
            <>
              <div className="qp-add-sources">
                {sourceOptions.map(({ id, name, description }) => (
                  <label className={`qp-add-source${flow.sources[id] ? " is-selected" : ""}`} key={id}>
                    <span><strong>{name}</strong><small>{t(description)}</small></span>
                    <input type="checkbox" checked={flow.sources[id]} disabled={flow.isWorking}
                      onChange={event => flow.changeSource(id, event.target.checked)} aria-label={name} />
                  </label>
                ))}
              </div>
              <p className="qp-add-source-note">{t(flow.sourceMask === 0 ? "add.flow.sources.local" : "add.flow.sources.note")}</p>
            </>
          ) : (
            <div className="qp-add-next-note">
              <Library size="1.6rem" strokeWidth={1.4} />
              <h3>{t(isApp ? "add.flow.app.destination" : "add.flow.steam.destination")}</h3>
              <p>{t(isApp ? "add.flow.app.destinationHint" : "add.flow.steam.destinationHint")}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
