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
            width: "7.2rem",
            display: "flex",
            background: "rgba(255, 255, 255, 0.8)",
            flexDirection: "column",
            gap: "0.6rem",
            padding: "0.6rem",
            borderRadius: "1.3rem",
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                setIsOpen(false);
              }}
              style={{
                padding: "0.5rem 0.8rem",
                borderRadius: "1.1rem",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "1rem",
                fontWeight: "500",
                transition: "all 0.2s",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(0.75rem)",
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
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#333",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
}
