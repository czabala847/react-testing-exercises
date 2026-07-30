import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchCharacter from "../SearchCharacter"

describe("SearchCharacter", () => {
  it("mostrar el valor de la prop en el input", () => {
    render(<SearchCharacter searchTerm="hola" onSearchTerm={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("hola");
  });

  it("llamar a onSearchTerm con el valor del input", async() => {
    const onSearchTerm = jest.fn();
    render(<SearchCharacter searchTerm="" onSearchTerm={onSearchTerm} />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "hola");
    expect(onSearchTerm).toHaveBeenCalledTimes(4);
    expect(onSearchTerm).toHaveBeenLastCalledWith("a");
  });
});
