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

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", repository.html_url);
  });
});
