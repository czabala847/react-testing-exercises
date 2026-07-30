interface Props {
  searchTerm: string
  onSearchTerm: (searchTerm: string) => void
}

const SearchCharacter = ({ searchTerm, onSearchTerm }: Props) => {
  return (
    <input
      type="text"
      placeholder="Search character..."
      value={searchTerm}
      onChange={(event) => onSearchTerm(event.target.value)}
    />
  )
}

export default SearchCharacter
