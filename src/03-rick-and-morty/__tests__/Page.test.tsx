import { render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { createServer } from "../../test/server"
import { RickAndMortyPage } from "../Page"

const renderComponent = () => {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <RickAndMortyPage />
    </SWRConfig>,
  );
};

describe("Pagina principal", () => {
  createServer([
    {
      method: "get",
      path: "https://rickandmortyapi.com/api/character",
      res: () => ({
        results: [
          {
            id: 1,
            name: "Rick Sanchez",
            image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
            location: {
              name: "Citadel of Ricks",
            },
          },
          {
            id: 2,
            name: "Morty Smith",
            image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
            location: {
              name: "Citadel of Ricks",
            },
          },
        ],
      }),
    },
  ]);

  it("En la carga inicial se debe mostrar el loading", async () => {
    renderComponent();
    await waitFor(() => {
      const loading = screen.getByText("Loading...");
      expect(loading).toBeInTheDocument();
    });
  });

  it("mostrar el listado de personajes", async () => {
    renderComponent();
    const images = await screen.findAllByRole("img");
    expect(images).toHaveLength(2);
  });
});
