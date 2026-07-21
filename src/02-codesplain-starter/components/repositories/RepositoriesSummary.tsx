import { StarIcon } from "@primer/octicons-react"

interface Props {
  repository: {
    stargazers_count: number;
    open_issues: number;
    forks: number;
    language: string;
  };
}

function RepositoriesSummary({ repository }: Props) {
  const { stargazers_count, open_issues, forks } = repository;

  return (
    <div className="flex flex-row gap-4 text-gray-700">
      <div>
        <StarIcon aria-label="stars" size={16} /> {stargazers_count}
      </div>
      <div>{open_issues} issues need help</div>
      <div>{forks} Forks</div>
      <div>{repository.language}</div>
    </div>
  );
}

export default RepositoriesSummary;
