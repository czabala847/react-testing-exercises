import { render, screen } from "@testing-library/react"
import RepositoriesSummary from "../RepositoriesSummary"

describe("RepositoriesSummary", () => {
  it("displays the primary language of the repository", () => {
    const repository = { stargazers_count: 10, open_issues: 5, forks: 3, language: "TypeScript" };
    render(<RepositoriesSummary repository={repository} />);

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
