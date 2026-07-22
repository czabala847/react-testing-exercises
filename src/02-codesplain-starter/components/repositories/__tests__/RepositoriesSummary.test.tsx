import { render, screen } from "@testing-library/react"
import RepositoriesSummary from "../RepositoriesSummary"

describe("RepositoriesSummary", () => {
  it("displays information about the repository", () => {
    const repository = {
      stargazers_count: 10,
      open_issues: 5,
      forks: 3,
      language: "TypeScript",
    };
    render(<RepositoriesSummary repository={repository} />);

    for (const key in repository) {
      const value = repository[key as keyof typeof repository];
      const element = screen.getByText(new RegExp(value.toString()));
      expect(element).toBeInTheDocument();
    }
  });

  //   it("displays the primary language of the repository", () => {
  //     const repository = { stargazers_count: 10, open_issues: 5, forks: 3, language: "TypeScript" };
  //     render(<RepositoriesSummary repository={repository} />);

  //     expect(screen.getByText("TypeScript")).toBeInTheDocument();
  //   });
});
