import type { SearchResult, SearchSelection } from "../api/Add";

export type AddMethod = "single" | "batch" | "steam" | "app";
export type AddPhase = "setup" | "searching" | "review" | "committing" | "importing" | "success";

export interface AddSearchItem {
  result: SearchResult;
  cacheIndex: number;
  selectedIndex: number | null;
  included: boolean;
}

export function createAddSearchItem(result: SearchResult, cacheIndex: number): AddSearchItem {
  const hasCandidates = result.searched_games.length > 0;
  return { result, cacheIndex, selectedIndex: hasCandidates ? 0 : null, included: hasCandidates };
}

export function getAddSelections(items: AddSearchItem[]): SearchSelection[] {
  return items.flatMap(({ result, cacheIndex, selectedIndex, included }) =>
    included && selectedIndex !== null && result.searched_games[selectedIndex]
      ? [[cacheIndex, selectedIndex] as SearchSelection]
      : [],
  );
}

export function getProgramName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}
