import { render, screen } from "@testing-library/react"
import { UserForm } from "../UserForm"

describe("UserForm", () => {
  test("it shows two inputs and a button", () => {
    //render the component
    render(<UserForm onUserAdd={() => {}} />);

    //manipulate the component or find an element in it
    const inputs = screen.getAllByRole("textbox");
    const button = screen.getByRole("button");

    //assertion
    expect(inputs).toHaveLength(2);
    expect(button).toBeInTheDocument();
  });
});
