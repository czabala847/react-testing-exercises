import { CharacterItem } from "./components/CharacterItem"
import SearchCharacter from "./components/SearchCharacter"
import { useRickMorty } from "./hooks/useRickMorty"

export const RickAndMortyPage = () => {
  const { data, error, isLoading, searchTerm, onSearchTerm } = useRickMorty();

  return (
    <div>
      <h1>Rick and Morty</h1>
      <h2>List of characters</h2>
      <SearchCharacter searchTerm={searchTerm} onSearchTerm={onSearchTerm} />
      {isLoading && <div>Loading...</div>}
      {error && <div>error</div>}
      {(data || []).map((character) => (
        <CharacterItem key={character.id} character={character} />
      ))}
    </div>
  );
};
