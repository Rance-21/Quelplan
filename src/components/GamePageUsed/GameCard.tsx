import { useState } from "react";

export function GameCard({
  title,
  coverUrl,
  onClick,
}: {
  title: string;
  coverUrl: string;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        width: isHovered ? "85%" : "80%",
        aspectRatio: "3 / 4",
        borderRadius: "0.75rem",
        overflow: "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        position: "relative",
        transformOrigin: "center",
        transition: "width 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
      }}
    >
      {/* 封面图 */}
      <img
        src={coverUrl}
        alt={title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)", // 平滑放大缩小的动画
        }}
      />

      {/* 底部名字遮罩 (从下往上的黑色渐变) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "1rem",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      >
        <h3
          style={{
            color: "white",
            fontWeight: "bold",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis", // 文字太长自动变成 ...
          }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
