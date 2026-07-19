import { showToast } from "../components/ui/Toast";

export function showApiError(error: unknown) {
  showToast(String(error), "error");
}
