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
        gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))",
        gap: "1.5rem",
        paddingTop: "0rem",
      }}
    >
      {games.map((game) => (
        <div key={game.id} className="animate-lime">
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
