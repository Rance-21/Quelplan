import { FolderHeart, Settings, Undo2 } from "lucide-react";
import TempIcon from "../assets/TempIcon.png";

export interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menuName: string) => void;
}

function NavButton({
  icon: Icon,
  isActive = false,
  onClick,
}: {
  icon: any;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300
        hover:scale-110 hover:bg-slate-300/50 hover:shadow-md
        ${
          isActive
            ? "bg-slate-300/60 text-slate-800 shadow-sm border border-white/20"
            : "text-slate-600 border border-transparent"
        }
      `}
      style={{}}
    >
      <Icon size={24} strokeWidth={1.5} />
    </button>
  );
}

/// 侧边栏主组件
export function Sidebar({ activeMenu, onMenuClick }: SidebarProps) {
  const isHome = activeMenu === "Home";
  return (
    <aside
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: "100vh",
        width: "4.8rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1rem",
        paddingBottom: "1.5rem",
        gap: "0.6rem",
        zIndex: 40,
        background: "rgba(18, 18, 18, 0.3)",
        backdropFilter: "blur(12px)",
        borderRightWidth: 0,
      }}
    >
      {/* 顶部 Logo 区域 */}
      <div
        style={{
          width: "3rem",
          height: "3rem",
          display: "flex",
          justifyContent: "center",
          borderRadius: "2rem",
          backgroundColor: "rgba(203, 213, 225, 0.3)",
          borderWidth: "1px",
          borderStyle: "solid",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {isHome ? (
          <img
            src={TempIcon}
            alt="Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <NavButton
            icon={Undo2}
            isActive={true}
            onClick={() => onMenuClick("Home")}
          />
        )}
      </div>

      {/* 导航图标区域 */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          width: "100%",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
        }}
      >
        <NavButton
          icon={FolderHeart}
          isActive={true}
          onClick={() => onMenuClick("Folder")}
        />
      </nav>

      <nav
        style={{
          display: "flex",
          gap: "1rem",
          marginTop: "1rem",
          width: "100%",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
        }}
      >
        <NavButton
          icon={Settings}
          isActive={true}
          onClick={() => onMenuClick("Settings")}
        />
      </nav>
    </aside>
  );
}
