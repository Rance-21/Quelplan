import { useState } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ListFilter,
  Check,
} from "lucide-react";

export type SortType = "add_time" | "rating" | "last_played" | "release_date";
export type SortOrder = "asc" | "desc";

export function SortButton({
  onSortChange,
}: {
  onSortChange: (t: SortType, o: SortOrder) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<SortType>("add_time");
  const [order, setOrder] = useState<SortOrder>("desc");

  // 状态更新与接口调用合并为一行
  const update = (t: SortType, o: SortOrder) => {
    setType(t);
    setOrder(o);
    onSortChange(t, o);
  };

  const opts: { l: string; v: SortType }[] = [
    { l: "添加时间", v: "add_time" },
    { l: "评分", v: "rating" },
    { l: "最近游玩", v: "last_played" },
    { l: "发售时间", v: "release_date" },
  ];

  return (
    <div
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      style={{ position: "relative", zIndex: 50 }}
      data-tauri-drag-region="false"
    >
      {/* 主按钮 */}
      <button
        className="s-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2rem",
          height: "2rem",
          paddingLeft: "0.26rem",
          background: "rgba(147, 197, 253, 0.5)",
          border: "0.1rem solid rgba(147, 197, 253, 0.4)",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        <ListFilter size={16} style={{ marginRight: "0.25rem" }} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            width: "12rem",
            background: "rgba(30, 30, 30, 0.6)",
            top: "calc(100% + 0.5rem)",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* 升降序切换 */}
          <div
            style={{
              display: "flex",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: "0.5rem",
              padding: "0.25rem",
              marginBottom: "0.25rem",
            }}
          >
            {(["desc", "asc"] as SortOrder[]).map((o) => (
              <button
                key={o}
                onClick={() => update(type, o)}
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  padding: "0.4rem 0",
                  borderRadius: "0.4rem",
                  border: "none",
                  background:
                    order === o ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  color: order === o ? "#fff" : "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {o === "desc" ? (
                  <ArrowDownWideNarrow size={16} />
                ) : (
                  <ArrowUpNarrowWide size={16} />
                )}
              </button>
            ))}
          </div>

          {/* 排序字段 */}
          {opts.map(({ l, v }) => (
            <button
              key={v}
              className="s-opt"
              onClick={() => update(v, order)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.6rem 0.8rem",
                background:
                  type === v ? "rgba(255, 255, 255, 0.05)" : "transparent",
                borderRadius: "0.5rem",
                color: type === v ? "#fff" : "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              <span>{l}</span>
              {type === v && <Check size={16} color="#93c5fd" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
