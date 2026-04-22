import { Search } from "lucide-react";

export interface SearchBoxProps {
  onSearch: (keyword: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "24rem",
        padding: "0.2rem 0.4rem 0.2rem 1rem", // 右边的 padding 变小，因为按钮自己有 padding
        borderRadius: "625rem",
        border: "0.2rem solid rgba(255, 255, 255, 0.8)",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      }}
      data-tauri-drag-region="false"
    >
      {/* 1. 左侧：搜索小图标 */}
      <Search
        size={18}
        color="rgba(0, 0, 0, 1)"
        style={{ marginRight: "0.625rem" }}
      />

      {/* 2. 中间：输入框 */}
      <input
        type="text"
        placeholder="搜索本地游戏..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          flex: 1,
          fontSize: "1rem",
          color: "#333",

          outline: "none",
          border: "none",
          background: "transparent",
        }}
      />
    </div>
  );
}
