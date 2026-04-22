import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function More() {
  const [isOpen, setIsOpen] = useState(false);

  const options = ["详情页", "关联启动", "游戏目录"];

  return (
    <div style={{ position: "relative" }}>
      {/* 向上展开的菜单 */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 0.8rem)", // 向上偏移
            width: "7rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            padding: "0.6rem",
            borderRadius: "1rem",
            backdropFilter: "blur(1.6rem)",
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                setIsOpen(false);
              }}
              style={{
                padding: "0.7rem 1rem",
                borderRadius: "0.6rem",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.2s",
                backgroundColor: "rgba(18, 18, 18, 0.1)",
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}

      {/* 圆形更多按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "50%",
          backgroundColor: "rgba(82, 211, 211, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
}
