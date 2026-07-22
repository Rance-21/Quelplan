import { getCurrentWindow } from "@tauri-apps/api/window";
import { Check, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  dismissToast,
  getToastDuration,
  showToast,
  subscribeToToastEvents,
  type ToastEvent,
  type ToastIcon,
  type ToastState,
} from "./toastStore";

export { dismissToast, showToast } from "./toastStore";
export type { ToastIcon } from "./toastStore";

const toastErrorEvent = "toast-error";

interface ToastProps {
  message: string;
  icon: ToastIcon;
  visible: boolean;
}

const iconStyles: Record<
  ToastIcon,
  { backgroundColor: string; color: string }
> = {
  success: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    color: "#22c55e",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
  },
  loading: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
  },
};

const toastIcons = {
  success: Check,
  error: X,
  loading: LoaderCircle,
};

export function Toast({ message, icon, visible }: ToastProps) {
  const Icon = toastIcons[icon];

  return createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "3rem",
        left: "50%",
        transform: visible ? "translate(-50%, 0)" : "translate(-50%, 1.5rem)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "all 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1.5rem",
        backgroundColor: "var(--qp-surface-strong)",
        borderRadius: "1rem",
        minWidth: "16rem",
        maxWidth: "90vw",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "50%",
          ...iconStyles[icon],
        }}
      >
        <Icon
          width={14}
          height={14}
          strokeWidth={3}
          className={icon === "loading" ? "qp-toast-spinner" : undefined}
        />
      </div>

      <span
        style={{
          color: "var(--qp-text)",
          fontSize: "0.95rem",
          fontWeight: "600",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {message}
      </span>
    </div>,
    document.body,
  );
}

export function ToastViewport() {
  const [display, setDisplay] = useState<{
    toast: ToastState | null;
    visible: boolean;
  }>({ toast: null, visible: false });

  useEffect(() => {
    const listener = (event: ToastEvent) => {
      if (event.type === "show") {
        setDisplay({ toast: event.toast, visible: true });
        return;
      }

      setDisplay((current) =>
        current.toast?.id === event.id
          ? { ...current, visible: false }
          : current,
      );
    };

    return subscribeToToastEvents(listener);
  }, []);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;
    let currentWindow: ReturnType<typeof getCurrentWindow>;

    try {
      currentWindow = getCurrentWindow();
    } catch {
      return;
    }

    void currentWindow
      .listen<string>(toastErrorEvent, ({ payload }) => {
        showToast(payload, "error");
      })
      .then((nextUnlisten) => {
        if (disposed) {
          nextUnlisten();
          return;
        }

        unlisten = nextUnlisten;
      });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!display.toast) return;

    if (!display.visible) {
      const clearTimer = window.setTimeout(() => {
        setDisplay((current) =>
          current.toast?.id === display.toast?.id && !current.visible
            ? { toast: null, visible: false }
            : current,
        );
      }, 180);

      return () => window.clearTimeout(clearTimer);
    }

    const duration = getToastDuration(display.toast.icon);
    if (duration === null) return;

    const hideTimer = window.setTimeout(() => {
      dismissToast(display.toast!.id);
    }, duration);

    return () => window.clearTimeout(hideTimer);
  }, [display]);

  if (!display.toast) return null;

  return (
    <Toast
      message={display.toast.message}
      icon={display.toast.icon}
      visible={display.visible}
    />
  );
}
