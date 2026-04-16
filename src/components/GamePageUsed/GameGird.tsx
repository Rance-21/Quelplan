import { GameCard } from "./GameCard";

export function GameGrid({ games }: { games: any[] }) {
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
        <GameCard key={game.id} title={game.title} coverUrl={game.coverUrl} />
      ))}
    </div>
  );
}
