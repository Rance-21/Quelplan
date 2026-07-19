import type { MainGame } from "../../api/GetMainGame";
import { MainGamePreview } from "../../components/main/MainGamePreview";
import { StartGame } from "../../components/main/StartGame";

interface MainPageProps {
  mainGame: MainGame | null;
  onOpenDetail: (id: number) => void;
}

export function MainPage({ mainGame, onOpenDetail }: MainPageProps) {
  if (!mainGame) {
    return <div />;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "4rem",
          right: "4rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <StartGame id={mainGame.id} />
      </div>

      {mainGame.name && mainGame.coverUrl && (
        <MainGamePreview
          mainGame={mainGame}
          onOpenDetail={onOpenDetail}
        />
      )}
    </div>
  );
}
