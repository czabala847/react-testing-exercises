import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import type { Repository } from "../../../domain/Repository"
import RepositoriesListItem from "../RepositoriesListItem"

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
    </MemoryRouter>
  );
};

describe("RepositoriesListItem", () => {
  it("shows a link to the github homepage of the repository", () => {
    renderComponent();
  });
});
