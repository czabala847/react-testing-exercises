import { render, screen } from "@testing-library/react"
import type { Character } from "../../model/characters"
import { CharacterItem } from "../CharacterItem"

describe("CharacterItem", () => {
  it("mostrar datos del personaje recibido por props", () => {
    render(
      <CharacterItem
        character={
          {
            name: "name test",
            image: "image test",
            location: { name: "location test", url: "test" },
          } as Character
        }
      />,
    );

    const img = screen.getByRole("img");
    const name = screen.getByRole("heading");
    const location = screen.getByRole("paragraph");

    expect(img).toHaveAttribute("src", "image test");
    expect(name).toHaveTextContent("name test");
    expect(location).toHaveTextContent("location test");
  });
});
