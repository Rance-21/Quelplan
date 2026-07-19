import { invokeApi } from "./invoke";

export function exportByfen(directoryPath: string): Promise<void> {
  return invokeApi("db_byfen", { path: directoryPath });
}

export function importByfen(directoryPath: string): Promise<void> {
  return invokeApi("import_byfen", { path: directoryPath });
}
