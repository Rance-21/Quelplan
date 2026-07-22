import type { FolderGamePatch } from "../../api/foldergames";
import { FinishButton } from "../../components/detail/FinishButton";
import { DetailForm } from "../../components/detail/Form";
import { LikeButton } from "../../components/detail/LikeButton";
import { DetailMetrics } from "../../components/detail/Metrics";
import { StartGame } from "../../components/main/StartGame";
import { useDetailPage } from "../../hooks/useDetailPage";

interface DetailPageProps {
  id: number;
  onFolderGameUpdate: (id: number, patch: FolderGamePatch) => void;
}

export default function DetailPage({ id, onFolderGameUpdate }: DetailPageProps) {
  const {
    game,
    apps,
    pendingFields,
    coverSrc,
    handleToggleBooleanField,
    handleGameFieldChange,
    handleGameExePathChange,
    handleLinkExeChange,
  } = useDetailPage({ id, onFolderGameUpdate });

  if (!game) {
    return <div></div>;
  }

  return (
    <div
      className="qp-detail-page qp-page-surface"
      style={{
        position: "absolute",
        inset: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "min(100%, 82rem)",
          height: "100%",
          minHeight: 0,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <section className="qp-detail-hero">
          <div className="qp-detail-cover">
            {coverSrc && (
              <img
                src={coverSrc}
                alt={game.name}
                style={{ width: "auto", height: "100%", display: "block" }}
              />
            )}
          </div>

          <div
            style={{
              minWidth: 0,
              display: "flex",
              flex: 1,
              flexDirection: "column",
              gap: "1.15rem",
              padding: "0.4rem 0 0.25rem",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <h1
                  title={game.name}
                  style={{
                    minWidth: 0,
                    margin: 0,
                    overflow: "hidden",
                    color: "var(--qp-text)",
                    fontSize: "clamp(2rem, 3vw, 2.75rem)",
                    fontWeight: 780,
                    letterSpacing: "-0.045em",
                    lineHeight: 1.08,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {game.name}
                </h1>
                <div
                  style={{
                    display: "flex",
                    flexShrink: 0,
                    alignItems: "center",
                    gap: "0.55rem",
                  }}
                >
                  <LikeButton
                    liked={game.liked}
                    disabled={pendingFields.liked}
                    onClick={() => void handleToggleBooleanField("liked")}
                  />
                  <FinishButton
                    ifFinished={game.if_finished}
                    disabled={pendingFields.if_finished}
                    onClick={() => void handleToggleBooleanField("if_finished")}
                  />
                </div>
              </div>
            </div>

            <DetailMetrics game={game} />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "auto",
              }}
            >
              <StartGame id={game.id} />
            </div>
          </div>
        </section>

        <div className="qp-detail-divider" />

        <DetailForm
          initialData={game}
          apps={apps}
          onGameFieldChange={handleGameFieldChange}
          onGameExePathChange={handleGameExePathChange}
          onLinkExeChange={handleLinkExeChange}
        />
      </div>
    </div>
  );
}
