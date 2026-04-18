import { useEffect, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

// 1. 窗口按钮组件
function WindowButton({
  icon: Icon,
  onClick,
  isClose = false,
}: {
  icon: any;
  onClick: () => void;
  isClose?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: "100%",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        cursor: "default",
        borderRadius: "1.5rem",
        // 核心：根据 isHovered 动态切换颜色
        backgroundColor: isHovered ? "rgba(82, 211, 211, 0.5)" : "transparent",
        color: isHovered ? "#ffffff" : "#94a3b8", // slate-400 (#94a3b8) 变纯白

        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      {/* 根据图标类型微调大小，关闭按钮稍大一点 */}
      <Icon size={isClose ? 18 : Icon === Minus ? 16 : 14} strokeWidth={1} />
    </button>
  );
}

// 2. 顶部栏主组件
export function Topbar() {
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // 1. 组件刚加载时，先查一下当前窗口是不是最大化
    appWindow.isMaximized().then(setIsMaximized);

    // 2. 监听窗口大小变化事件 (不论是点击、双击标题栏还是拖拽边缘，都会触发)
    const unlisten = appWindow.onResized(async () => {
      const maximized = await appWindow.isMaximized();
      setIsMaximized(maximized);
    });

    // 3. 卸载组件时清理监听器，防止内存泄漏
    return () => {
      unlisten.then((f) => f());
    };
  }, [appWindow]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "99.5%",
        height: "2.25rem",
        zIndex: 50,
        display: "flex",
        borderRadius: "2.1rem 2.1rem 2.1rem 2.1rem",
        justifyContent: "space-between",
        alignItems: "center",
        userSelect: "none", // 防止拖拽时误选中文字
      }}
    >
      {/* 左侧空白区域，保持和右侧按钮一样的宽度，方便用户拖动窗口 */}
      <div
        data-tauri-drag-region
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(255, 0, 0, 0.5)",
        }}
      />

      {/* 右侧控制按钮组 */}
      <div style={{ display: "flex", height: "100%" }}>
        <WindowButton icon={Minus} onClick={() => appWindow.minimize()} />
        <WindowButton
          icon={isMaximized ? Copy : Square}
          onClick={() => appWindow.toggleMaximize()}
        />
        <WindowButton
          icon={X}
          onClick={() => appWindow.close()}
          isClose={true}
        />
      </div>
    </header>
  );
}
