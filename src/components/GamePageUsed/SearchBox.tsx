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
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: "625rem",
        border: "0.2rem solid rgba(147, 197, 253, 0.4)",
        boxShadow: "0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)",
      }}
      className="no-drag"
    >
      {/* 1. 左侧：搜索小图标 */}
      <Search
        size={18}
        color="rgba(0, 0, 0, 0.6)"
        style={{ marginRight: "0.625rem" }}
      />

      {/* 2. 中间：输入框 (利用 flex: 1 把右边的排序按钮顶到最右侧) */}
      <input
        type="text"
        placeholder="搜索本地游戏..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          color: "rgba(0, 0, 0, 0.8)",
          fontSize: "1rem",
        }}
      />
    </div>
  );
}
