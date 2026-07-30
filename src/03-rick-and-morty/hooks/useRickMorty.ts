import axios from "axios"
import { useEffect, useState } from "react"
import useSWR from "swr"
import type { RickResponse } from "../model/characters"

const DEBOUNCE_DELAY = 300

async function repositoriesFetcher(_key: string, name: string) {
  const res = await axios.get<RickResponse>(
    "https://rickandmortyapi.com/api/character",
    { params: { name } },
  );

  return res.data.results;
}

export const useRickMorty = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const { data, error, isLoading } = useSWR(
    ["/api/character", debouncedSearchTerm],
    ([key, name]) => repositoriesFetcher(key, name),
  );

  return {
    data,
    isLoading,
    error,
    searchTerm,
    onSearchTerm: setSearchTerm,
  };
};
