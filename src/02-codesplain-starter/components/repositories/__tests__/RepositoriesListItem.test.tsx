import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import type { Repository } from "../../../domain/Repository"
import RepositoriesListItem from "../RepositoriesListItem"

//another way to avoid the act warning is by creating a mock
// jest.mock("../../../tree/FileIcon", () => {
//   //content of FileIcon.tsx
//   return () => {
//     return 'File Icon componente'
//   }
// })

const renderComponent = () => {
  const repository: Repository = {
    full_name: "test repo",
    language: "TypeScript",
    description: "test description",
    owner: { login: "test owner" },
    name: "test name",
    stargazers_count: 10,
    open_issues: 5,
    forks: 3,
    html_url: "https://github.com/test/repo",
    id: 1,
  };
  render(
    <MemoryRouter>
      <RepositoriesListItem repository={repository} />
    </MemoryRouter>,
  );

  return { repository };
};

describe("RepositoriesListItem", () => {
  it("shows a link to the github homepage of the repository", async () => {
    const { repository } = renderComponent();

    // with this we resolve the act warning
    await screen.findByRole("img", { name: "TypeScript" });

    const link = screen.getByRole("link", {
      name: /github repository/i,
    });
    expect(link).toHaveAttribute("href", repository.html_url);
  });

  it("shows a fileicon with the appropiate icon", async () => {
    renderComponent();

    // with this we resolve the act warning
    const icon = await screen.findByRole("img", { name: "TypeScript" });
    expect(icon).toHaveClass("icon");
  });

  it("shows a link to the code editor page", async () => {
    const { repository } = renderComponent();

    // with this we resolve the act warning
    await screen.findByRole("img", { name: "TypeScript" });

    const link = await screen.findByRole("link", {
      name: new RegExp(repository.owner.login),
    });
    expect(link).toHaveAttribute(
      "href",
      `/repositories/${repository.full_name}`,
    );
  });
});
