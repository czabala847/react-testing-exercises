import { render, screen, within } from "@testing-library/react"
// import { render, screen } from "@testing-library/react"
import { UserList } from "../UserList"

function renderComponent(){
  const users = [
    { name: "test user 1", email: "a@b.com" },
    { name: "test user 2", email: "c@d.com" },
  ];
  render(<UserList users={users} />);

  return {users}
}

describe("UserList", () => {
  it("render one row per user", () => {
    // const users = [
    //   { name: "test user 1", email: "a@b.com" },
    //   { name: "test user 2", email: "c@d.com" },
    // ];
    // render(<UserList users={users} />);

    renderComponent();
    // const { container } = render(<UserList users={users} />);

    // screen.logTestingPlaygroundURL();

    // const rows = screen.getAllByRole("row");
    const rows = within(screen.getByTestId("users")).getAllByRole("row");
    // const rows = screen.getByTestId("users").querySelectorAll("tr");
    // const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(2);
  });

  it("render the email and name of each user", () => {
    // const users = [
    //   { name: "test user 1", email: "a@b.com" },
    //   { name: "test user 2", email: "c@d.com" },
    // ];
    // render(<UserList users={users} />);

    const {users} = renderComponent();

    // const cells = screen.getAllByRole("cell");
    // expect(cells).toHaveLength(4);
    // expect(cells[0]).toHaveTextContent("test user 1");
    // expect(cells[1]).toHaveTextContent("a@b.com");
    // expect(cells[2]).toHaveTextContent("test user 2");
    // expect(cells[3]).toHaveTextContent("c@d.com");

    for (const user of users) {
      const name = screen.getByRole("cell", { name: user.name });
      const email = screen.getByRole("cell", { name: user.email });
      expect(name).toBeInTheDocument();
      expect(email).toBeInTheDocument();
    }

  });
});
