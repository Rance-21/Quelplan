import { convertFileSrc } from "@tauri-apps/api/core";

export function coverSource(image: string): string {
  const trimmedImage = image.trim();
  if (trimmedImage.startsWith("//")) return `https:${trimmedImage}`;
  if (/^(https?:|data:|blob:|asset:)/i.test(trimmedImage)) {
    return trimmedImage;
  }
  return convertFileSrc(trimmedImage);
}
