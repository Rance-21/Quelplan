import { open } from "@tauri-apps/plugin-dialog";
import { showApiError } from "./ToastError";

export const imageFileExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "bmp",
  "avif",
  "svg",
  "tif",
  "tiff",
];

interface SelectSingleFileOptions {
  filterName: string;
  extensions: string[];
}

export async function selectSingleFile({
  filterName,
  extensions,
}: SelectSingleFileOptions): Promise<string | null> {
  try {
    const selectedPath = await open({
      multiple: false,
      directory: false,
      filters: [{ name: filterName, extensions }],
    });

    return typeof selectedPath === "string" ? selectedPath : null;
  } catch (error) {
    showApiError(error);
    return null;
  }
}

export async function selectDirectory(): Promise<string | null> {
  try {
    const selectedPath = await open({ multiple: false, directory: true });
    return typeof selectedPath === "string" ? selectedPath : null;
  } catch (error) {
    showApiError(error);
    return null;
  }
}
