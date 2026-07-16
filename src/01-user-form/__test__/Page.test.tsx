import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserFormPage } from "../Page"

describe("UserFormPage", () => {
  it("can receive a new user and show it in the list", async () => {
    render(<UserFormPage />);

    // const [name, email] = screen.getAllByRole("textbox");
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const button = screen.getByRole("button");

    await userEvent.type(nameInput, "test user 1");
    await userEvent.type(emailInput, "a@b.com");
    await userEvent.click(button);

    // screen.debug();
    const name = screen.getByRole("cell", { name: "test user 1" });
    const email = screen.getByRole("cell", { name: "a@b.com" });

    expect(name).toBeInTheDocument();
    expect(email).toBeInTheDocument();
  });
});
