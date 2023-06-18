import { Commit, type CommitType } from "./Commit";

type LatestCommitsProps = {
  commits: CommitType[];
};

export const LatestCommits: React.FC<LatestCommitsProps> = ({ commits }) => (
  <div className="w-full max-w-3xl space-y-3 flex flex-col justify-center ">
    {(commits ?? []).map((commit) => (
      <Commit key={commit.message} {...commit} />
    ))}
  </div>
);
