import React from 'react'
import type { Character } from '../model/characters'

interface Props {
  character: Character
}

export const CharacterItem: React.FC<Props> = ({ character }) => {
  return (
    <div>
      <img src={character.image} alt={character.name} />
      <h2>{character.name}</h2>
      <p>{character.location.name}</p>
    </div>
  )
}
