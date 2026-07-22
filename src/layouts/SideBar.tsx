import { convertFileSrc } from "@tauri-apps/api/core";
import { FolderHeart, Settings, Undo2, type LucideIcon } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import AppIcon from "../../src-tauri/icons/icon.png";
import { getAvatarPath } from "../api/setting";
import type { AppPage } from "../lib/navigation";

export interface SidebarProps {
  activeMenu: AppPage;
  onMenuClick: (menuName: AppPage) => void;
  onBack: () => void;
  forceBack?: boolean;
  interactionDisabled?: boolean;
}

const avatarUpdatedEvent = "quelplan-avatar-updated";

interface NavButtonProps {
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const NavButton = memo(function NavButton({
  icon: Icon,
  isActive = false,
  onClick,
  disabled = false,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`qp-nav-button animate-reveal${isActive ? " is-active" : ""}`}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.75rem",
        border: "1px solid transparent",
      }}
    >
      <Icon size={24} strokeWidth={1.5} />
    </button>
  );
});

export const Sidebar = memo(function Sidebar({
  activeMenu,
  onMenuClick,
  onBack,
  forceBack = false,
  interactionDisabled = false,
}: SidebarProps) {
  const [avatarSrc, setAvatarSrc] = useState(AppIcon);
  const isHome = activeMenu === "Home";
  const showBack = forceBack || !isHome;

  useEffect(() => {
    let isMounted = true;

    const refreshAvatar = () => {
      void getAvatarPath()
        .then((avatarPath) => {
          if (isMounted) {
            setAvatarSrc(avatarPath ? convertFileSrc(avatarPath) : AppIcon);
          }
        })
        .catch(() => undefined);
    };

    refreshAvatar();
    window.addEventListener(avatarUpdatedEvent, refreshAvatar);

    return () => {
      isMounted = false;
      window.removeEventListener(avatarUpdatedEvent, refreshAvatar);
    };
  }, []);

  const handleFolderClick = useCallback(() => {
    onMenuClick("Folder");
  }, [onMenuClick]);

  const handleSettingsClick = useCallback(() => {
    onMenuClick("Settings");
  }, [onMenuClick]);

  const handleAvatarError = useCallback(() => {
    setAvatarSrc(AppIcon);
  }, []);

  return (
    <aside
      style={{
        position: "absolute",
        height: "100vh",
        width: "4.8rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "1rem",
        paddingBottom: "1.5rem",
        gap: "0.6rem",
        zIndex: 40,
        background: "var(--qp-sidebar-bg)",
        borderRightWidth: 0,
      }}
    >
      <div
        style={{
          width: "3rem",
          height: "3rem",
          display: "flex",
          justifyContent: "center",
          borderRadius: "2rem",
          borderWidth: "0.0625rem",
          borderStyle: "solid",
          borderColor: "var(--qp-border-soft)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img
          src={avatarSrc}
          alt="Logo"
          onError={handleAvatarError}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: showBack ? 0 : 1,
            transform: showBack ? "scale(0.3)" : "scale(1)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: showBack ? 1 : 0,
            transform: showBack ? "scale(1)" : "scale(0.3)",
            pointerEvents: showBack ? "auto" : "none",
          }}
        >
          <NavButton
            icon={Undo2}
            onClick={onBack}
            disabled={interactionDisabled}
          />
        </div>
      </div>

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
          isActive={activeMenu === "Folder"}
          onClick={handleFolderClick}
          disabled={interactionDisabled}
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
          isActive={activeMenu === "Settings"}
          onClick={handleSettingsClick}
          disabled={interactionDisabled}
        />
      </nav>
    </aside>
  );
});
