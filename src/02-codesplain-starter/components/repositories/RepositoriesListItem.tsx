import { Link } from "react-router"
import type { Repository } from "../../domain/Repository"
import FileIcon from "../../tree/FileIcon"
import RepositoriesSummary from "./RepositoriesSummary"

interface Props {
  repository: Repository;
}

const RepositoriesListItem = ({ repository }: Props) => {
  const { full_name, language, description, owner, name } = repository;

  return (
    <div className="py-3 border-b flex">
      <FileIcon name={language} className="shrink w-6 pt-1" />
      <div>
        <Link to={`/repositories/${full_name}`} className="text-xl">
          {owner.login}/<span className="font-bold">{name}</span>
        </Link>
        <p className="text-gray-500 italic py-1">{description}</p>
        <RepositoriesSummary repository={repository} />
      </div>
    </div>
  );
};

export default RepositoriesListItem;
