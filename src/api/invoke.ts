import { invoke } from "@tauri-apps/api/core";
import { showApiError } from "./ToastError";

type InvokeArguments = Record<string, unknown>;

export async function withApiErrorToast<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    showApiError(error);
    throw error;
  }
}

export function invokeApi<T = void>(
  command: string,
  commandArguments: InvokeArguments = {},
): Promise<T> {
  return withApiErrorToast(() => invoke<T>(command, commandArguments));
}
