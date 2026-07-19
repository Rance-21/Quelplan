import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, Minus, Square, X, type LucideIcon } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { closeWindow } from "../api/Close";
import { showApiError } from "../api/ToastError";
import { useAppSettings } from "../lib/appSettings";

function getAppWindow() {
  try {
    return getCurrentWindow();
  } catch {
    return null;
  }
}

const appWindow = getAppWindow();

interface WindowButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  isClose?: boolean;
  disabled?: boolean;
}

const WindowButton = memo(function WindowButton({
  icon: Icon,
  onClick,
  isClose = false,
  disabled = false,
}: WindowButtonProps) {
  return (
    <button
      type="button"
      className="qp-window-button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: "100%",
        padding: "0 1rem",
        display: "flex",
        alignItems: "center",
        borderRadius: "1.5rem",
      }}
    >
      <Icon size={isClose ? 18 : Icon === Minus ? 16 : 14} strokeWidth={1.8} />
    </button>
  );
});

interface TopbarProps {
  closeDisabled?: boolean;
}

export const Topbar = memo(function Topbar({
  closeDisabled = false,
}: TopbarProps) {
  const { closeToTray } = useAppSettings();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    if (!appWindow) return;

    let disposed = false;
    let removeResizeListener: (() => void) | undefined;

    void appWindow
      .isMaximized()
      .then((maximized) => {
        if (!disposed) setIsMaximized(maximized);
      })
      .catch(() => undefined);

    void appWindow
      .onResized(() => {
        void appWindow
          .isMaximized()
          .then((maximized) => {
            if (!disposed) setIsMaximized(maximized);
          })
          .catch(() => undefined);
      })
      .then((unlisten) => {
        if (disposed) {
          unlisten();
        } else {
          removeResizeListener = unlisten;
        }
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      removeResizeListener?.();
    };
  }, []);

  const handleMinimize = useCallback(() => {
    if (!appWindow) return;
    void appWindow.minimize().catch(showApiError);
  }, []);

  const handleToggleMaximize = useCallback(() => {
    if (!appWindow) return;
    void appWindow.toggleMaximize().catch(showApiError);
  }, []);

  const handleClose = useCallback(async () => {
    if (!appWindow) return;
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    setIsClosing(true);

    if (closeToTray) {
      try {
        await appWindow.hide();
      } catch (error) {
        showApiError(error);
      } finally {
        isClosingRef.current = false;
        setIsClosing(false);
      }
      return;
    }

    try {
      await closeWindow();
    } catch {
      // closeWindow reports its own invoke failure.
      isClosingRef.current = false;
      setIsClosing(false);
      return;
    }

    try {
      await appWindow.close();
    } catch (error) {
      showApiError(error);
      isClosingRef.current = false;
      setIsClosing(false);
    }
  }, [closeToTray]);

  return (
    <header
      style={{
        position: "fixed",
        width: "99.5%",
        height: "2.5rem",
        zIndex: 50,
        display: "flex",
        borderRadius: "2.1rem",
        justifyContent: "space-between",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      <div
        data-tauri-drag-region
        style={{
          position: "absolute",
          height: "100%",
          width: "calc(100% - 14rem)",
          background: "transparent",
          left: "4.81rem",
        }}
      />

      <div
        style={{
          paddingTop: "0.6rem",
          display: "flex",
          height: "100%",
          marginLeft: "calc(100% - 10rem)",
          background: "transparent",
        }}
      >
        <WindowButton icon={Minus} onClick={handleMinimize} />
        <WindowButton
          icon={isMaximized ? Copy : Square}
          onClick={handleToggleMaximize}
        />
        <WindowButton
          icon={X}
          onClick={handleClose}
          isClose
          disabled={isClosing || closeDisabled}
        />
      </div>
    </header>
  );
});
