function executableStem(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf(".");
  return extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
}

export function getDefaultGameName(executablePath: string): string {
  const normalizedPath = executablePath.trim().replace(/\\/g, "/");
  const pathWithoutTrailingSeparators = normalizedPath.replace(/\/+$/, "");
  const segments = pathWithoutTrailingSeparators.split("/").filter(Boolean);
  const fileName = segments[segments.length - 1] ?? "";
  const parentName = segments[segments.length - 2] ?? "";

  if (parentName && !/^[a-z]:$/i.test(parentName)) {
    return parentName;
  }

  return executableStem(fileName);
}
