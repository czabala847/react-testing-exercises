import { render, screen } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { MemoryRouter } from "react-router"
import HomeRoute from "../HomeRoute"

const handlers = [
  http.get("/api/repositories", ({ request }) => {
    const query = new URL(request.url).searchParams.get("q");

    const language = query?.split("language:")[1];

    return HttpResponse.json({
      items: [
        {
          id: 1,
          full_name: `${language}_one`,
        },
        {
          id: 2,
          full_name: `${language}_two`,
        },
      ],
    });
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HomeRoute", () => {
  it("renders two links for each languange", async () => {
    render(
      <MemoryRouter>
        <HomeRoute />
      </MemoryRouter>,
    );

    // await pause();
    // screen.debug();

    const languages = [
      "javascript",
      "typescript",
      "python",
      "rust",
      "go",
      "java",
    ];

    //loop over each language
    for (const language of languages) {
      //for each language, make sure we see two links
      const links = await screen.findAllByRole("link", {
        name: new RegExp(`${language}_`),
      });
      expect(links).toHaveLength(2);
      //assert that the links have the appropriate full_name
      expect(links[0]).toHaveTextContent(`${language}_one`);
      expect(links[0]).toHaveAttribute("href", `/repositories/${language}_one`);
      expect(links[1]).toHaveTextContent(`${language}_two`);
      expect(links[1]).toHaveAttribute("href", `/repositories/${language}_two`);
    }

  });
});

const pause = () => new Promise((resolve) => setTimeout(resolve, 100));
