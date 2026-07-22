export interface Repository {
  full_name: string;
  language: string;
  description: string;
  owner: {
    login: string;
  };
  name: string;
  stargazers_count: number;
  open_issues: number;
  forks: number;
}
