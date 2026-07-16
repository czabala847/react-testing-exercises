 
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { UserForm } from "../UserForm"

describe("UserForm", () => {
  it("it shows two inputs and a button", () => {
    //render the component
    render(<UserForm onUserAdd={() => {}} />);

    //manipulate the component or find an element in it
    const inputs = screen.getAllByRole("textbox");
    const button = screen.getByRole("button");

    //assertion
    expect(inputs).toHaveLength(2);
    expect(button).toBeInTheDocument();
  });

  it("it calls onUserAdd when the form is submitted", async () => {
    const user = userEvent.setup()

    const mock = jest.fn();
    render(<UserForm onUserAdd={mock} />);

    // const [name, email] = screen.getAllByRole("textbox");
    const name = screen.getByRole("textbox", { name: /name/i });
    const email = screen.getByRole("textbox", { name: /email/i });
    const button = screen.getByRole("button");

    //simulate typing in the inputs
    await user.type(name, "test user");
    await user.type(email, "Hd0e2@example.com");

    //simulate clicking the button
    await user.click(button);

    //assertion
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith({ name: "test user", email: "Hd0e2@example.com" });
  });

  it("empties the two inputs when the form is submitted", async () => {
    const user = userEvent.setup()

    render(<UserForm onUserAdd={() => {}} />);

    // const [name, email] = screen.getAllByRole("textbox");
    const name = screen.getByRole("textbox", { name: /name/i });
    const email = screen.getByRole("textbox", { name: /email/i });
    const button = screen.getByRole("button");

    //simulate typing in the inputs
    await user.type(name, "test user");
    await user.type(email, "Hd0e2@example.com");

    //simulate clicking the button
    await user.click(button);

    //assertion
    expect(name).toHaveValue("");
    expect(email).toHaveValue("");
  });
});
