import { GameGrid } from "../../components/GamePageUsed/GameGird";
import { SearchBox } from "../../components/GamePageUsed/SearchBox";
import { SortButton } from "../../components/GamePageUsed/SortButton";

export function FolderPage({
  onGameSelect,
}: {
  onGameSelect: (id: number) => void;
}) {
  const mockGames = [
    {
      id: 1,
      title: "赛博朋克 2077",
      coverUrl:
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "艾尔登法环",
      coverUrl:
        "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "荒野大镖客 2",
      coverUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "塞尔达传说",
      coverUrl:
        "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: 5,
      title: "巫师 3",
      coverUrl:
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return (
    <div>
      {/*顶部搜索和排序*/}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          paddingLeft: "4.8rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            paddingLeft: "2rem",
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            width: "50%",
            zIndex: 60,
          }}
        >
          <SearchBox
            onSearch={(keyword) => {
              console.log("准备发送给 Rust 的关键字:", keyword);
              // 以后这里就会调用 invoke('search_games', { query: keyword })
            }}
          />

          <SortButton
            onSortChange={(type, order) => {
              console.log("准备发送给 Rust 的排序规则:", { type, order });
            }}
          />
        </div>
        {/* 核心滚动区：绑定我们刚才定义的专用 ID */}
        <div
          id="folder-scroll-container"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem 2rem 2.5rem 2rem",
            paddingTop: "0rem",
            backdropFilter: "blur(0.125rem)",
          }}
        >
          <GameGrid
            games={[
              ...mockGames,
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
              ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
            ]}
            onGameSelect={onGameSelect}
          />
        </div>
      </div>
    </div>
  );
}
