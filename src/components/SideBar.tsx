import { FolderHeart } from "lucide-react";
import TempIcon from "../assets/TempIcon.png";

function NavButton({
  icon: Icon,
  isActive = false,
}: {
  icon: any;
  isActive?: boolean;
}) {
  return (
    <button
      className={`
        w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300
        hover:scale-110 hover:bg-slate-300/50 hover:shadow-md
        ${
          isActive
            ? "bg-slate-300/60 text-slate-800 shadow-sm border border-white/20"
            : "text-slate-600 border border-transparent"
        }
      `}
    >
      <Icon size={24} strokeWidth={1.5} />
    </button>
  );
}

/// 侧边栏主组件
export function Sidebar() {
  return (
    <aside
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: "4.8rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        gap: "2rem",
        zIndex: 40,
        background:
          "linear-gradient(to right, rgba(18, 18, 18, 0.8) 0%, rgba(18, 18, 18, 0.8))",
        backdropFilter: "blur(12px)", // 对应 backdrop-blur-md
        WebkitBackdropFilter: "blur(12px)", // 兼容 Safari
        borderRightWidth: 0,
      }}
    >
      {/* 顶部 Logo 区域 */}
      <div
        style={{
          width: "3rem",
          height: "3rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "0.75rem",
          backgroundColor: "rgba(203, 213, 225, 0.3)",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "rgba(255, 255, 255, 0.2)",
          overflow: "hidden",
        }}
      >
        <img
          src={TempIcon}
          alt="Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transitionProperty: "all",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDuration: "300ms",
          }}
        />
      </div>

      {/* 导航图标区域 */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
          width: "100%",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
        }}
      >
        <NavButton icon={FolderHeart} isActive={true} />
      </nav>
    </aside>
  );
}
