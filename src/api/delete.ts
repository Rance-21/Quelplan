import { showToast } from "../components/ui/Toast";
import { translate } from "../lib/i18n";
import { invokeApi } from "./invoke";

export async function deleteGame(id: number): Promise<boolean> {
  try {
    await invokeApi("delete", { id });
  showToast(translate("toast.deleteGameSuccess"), "success");
    return true;
  } catch {
    return false;
  }
}
