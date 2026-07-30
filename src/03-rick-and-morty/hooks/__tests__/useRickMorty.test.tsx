import { act, renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { SWRConfig } from "swr"
import { createServer } from "../../../test/server"
import { useRickMorty } from "../useRickMorty"

const renderHookWithServer = () => {
  const { result } = renderHook(() => useRickMorty(), {
    wrapper: ({ children }) => (
      <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
    ),
  });
  return { result };
};

describe("useRickMorty", () => {
  const { server } = createServer([
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

  it("carga inicial, loading en true y el resto undefined", async () => {
    const { result } = renderHookWithServer();
    const { data, error, isLoading } = result.current;

    await waitFor(() => {
      expect(data).toBeUndefined();
      expect(error).toBeUndefined();
      expect(isLoading).toBe(true);
    });
  });

  it("respuesta exitosa", async () => {
    const { result } = renderHookWithServer();

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
      expect(result.current.error).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("respuesta fallida", async () => {
    server.use(
      http.get("https://rickandmortyapi.com/api/character", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { result } = renderHookWithServer();

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("agrupa llamadas rapidas de onSearchTerm en una sola peticion tras el debounce", async () => {
    let requestCount = 0;
    server.use(
      http.get("https://rickandmortyapi.com/api/character", () => {
        requestCount++;
        return HttpResponse.json({
          results: [
            {
              id: 1,
              name: "Rick Sanchez",
              image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
              location: { name: "Citadel of Ricks" },
            },
          ],
        });
      }),
    );

    const { result } = renderHookWithServer();

    // Dejamos que la peticion del montaje inicial (name: "") se resuelva
    // con timers reales antes de activar los fake timers.
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    jest.useFakeTimers({
      doNotFake: ["nextTick", "setImmediate", "queueMicrotask"],
    });

    // Cada llamada va en su propio act() para simular "teclas" separadas:
    // cada una debe cancelar el timeout que dejo la anterior.
    act(() => {
      result.current.onSearchTerm("r");
    });
    act(() => {
      result.current.onSearchTerm("ri");
    });
    act(() => {
      result.current.onSearchTerm("rick");
    });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    jest.useRealTimers();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 2 peticiones esperadas: la del montaje inicial (name: "")
    // + la del debounce (name: "rick"). Si el debounce no
    // funcionara, veriamos 4 (una por cada valor: "", "r", "ri", "rick").
    expect(requestCount).toBe(2);
  });
});
