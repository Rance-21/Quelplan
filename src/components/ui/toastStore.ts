export type ToastIcon = "success" | "error" | "loading";

export const TOAST_DURATION = 3000;

export interface ToastState {
  id: number;
  message: string;
  icon: ToastIcon;
}

export type ToastEvent =
  | { type: "show"; toast: ToastState }
  | { type: "dismiss"; id: number };

type ToastListener = (event: ToastEvent) => void;

const toastListeners = new Set<ToastListener>();
let toastId = 0;
let activeToastId: number | null = null;

export function showToast(message: string, icon: ToastIcon): number {
  const toast = {
    id: toastId + 1,
    message,
    icon,
  };

  toastId = toast.id;
  activeToastId = toast.id;
  toastListeners.forEach((listener) => listener({ type: "show", toast }));
  return toast.id;
}

export function getToastDuration(icon: ToastIcon): number | null {
  return icon === "loading" ? null : TOAST_DURATION;
}

export function dismissToast(id: number) {
  if (activeToastId !== id) return;

  activeToastId = null;
  toastListeners.forEach((listener) => listener({ type: "dismiss", id }));
}

export function subscribeToToastEvents(listener: ToastListener): () => void {
  toastListeners.add(listener);
  return () => toastListeners.delete(listener);
}
