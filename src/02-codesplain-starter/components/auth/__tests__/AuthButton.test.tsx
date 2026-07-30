import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { SWRConfig } from "swr"
import { createServer } from "../../../../test/server"
import AuthButtons from "../AuthButtons"

async function renderComponent() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <AuthButtons />
      </MemoryRouter>
    </SWRConfig>,
  );

  await screen.findAllByRole("link");
}

describe("AuthButtons - when user is not signed in", () => {
  createServer([
    {
      method: "get",
      path: "/api/user",
      res: () => ({ user: null }),
    },
  ]);

  it("show the sign in and sign up button", async () => {
    await renderComponent();

    const singIn = screen.getByRole("link", { name: /sign in/i });
    const singUp = screen.getByRole("link", { name: /Sign up/i });

    expect(singIn).toBeInTheDocument();
    expect(singIn).toHaveAttribute("href", "/signin");

    expect(singUp).toBeInTheDocument();
    expect(singUp).toHaveAttribute("href", "/signup");
  });

  it("sign out is not visible", async () => {
    await renderComponent();

    const singOut = screen.queryByRole("link", { name: /sign out/i });
    expect(singOut).not.toBeInTheDocument();
  });
});

describe("AuthButtons - when user is signed in", () => {
  createServer([
    {
      method: "get",
      path: "/api/user",
      res: () => ({ user: { email: "a@b.com", name: "test user" } }),
    },
  ]);

  it("sign in and sign up are not visible", async () => {
    await renderComponent();

    const singIn = screen.queryByRole("link", { name: /sign in/i });
    const singUp = screen.queryByRole("link", { name: /Sign up/i });

    expect(singIn).not.toBeInTheDocument();
    expect(singUp).not.toBeInTheDocument();
  });

  it("sign out is visible", async () => {
    await renderComponent();

    const singOut = screen.getByRole("link", { name: /sign out/i });
    expect(singOut).toBeInTheDocument();
    expect(singOut).toHaveAttribute("href", "/signout");
  });
});
