import { useCallback, useMemo, useState } from "react";
import type { FolderGame } from "../api/foldergames";

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function useFolderSearch(games: FolderGame[]) {
  const [searchValue, setSearchValue] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearchSubmit = useCallback(() => {
    setSearchKeyword(normalizeSearchText(searchValue));
  }, [searchValue]);

  const searchedGames = useMemo(() => {
    if (!searchKeyword) {
      return games;
    }

    return games.filter((game) => {
      return normalizeSearchText(game.name).includes(searchKeyword);
    });
  }, [games, searchKeyword]);

  return {
    searchValue,
    searchedGames,
    handleSearchValueChange: setSearchValue,
    handleSearchSubmit,
  };
}
