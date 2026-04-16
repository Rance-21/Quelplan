import { GameGrid } from "../../components/GamePageUsed/GameGird";

export function FolderPage() {
  const mockGames = [
    {
      id: "1",
      title: "赛博朋克 2077",
      coverUrl:
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "艾尔登法环",
      coverUrl:
        "https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "3",
      title: "荒野大镖客 2",
      coverUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "4",
      title: "塞尔达传说",
      coverUrl:
        "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "5",
      title: "巫师 3",
      coverUrl:
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingTop: "3.4rem",
        paddingLeft: "4.8rem",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        #folder-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        #folder-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        #folder-scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        #folder-scroll-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* 核心滚动区：绑定我们刚才定义的专用 ID */}
      <div
        id="folder-scroll-container"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 2rem 2.5rem 2rem", // 左右边距和底边距
        }}
      >
        {/* 为了看滚动效果，把假数据复制两遍 */}
        <GameGrid
          games={[
            ...mockGames,
            ...mockGames.map((g) => ({ ...g, id: g.id + "_copy" })),
          ]}
        />
      </div>
    </div>
  );
}
