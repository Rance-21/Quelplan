import { GameCard } from "./GameCard";

export function GameGrid({
  games,
  onGameSelect,
}: {
  games: any[];
  onGameSelect: (id: number) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gridTemplateRows: "repeat(auto-fill, minmax(200px, 1fr))",
        width: "100%",
      }}
    >
      {games.map((game) => (
        <div key={game.id} className="animate-lime" style={{}}>
          <GameCard
            title={game.title}
            coverUrl={game.coverUrl}
            onClick={() => onGameSelect(game.id)}
          />
        </div>
      ))}
    </div>
  );
}
