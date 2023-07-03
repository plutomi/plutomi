import { Commit, type CommitType } from "./Commit";

type LatestCommitsProps = {
  commits: CommitType[];
};

export const LatestCommits: React.FC<LatestCommitsProps> = ({ commits }) => (
  <div className="w-full max-w-3xl space-y-3 flex flex-col justify-center px-4">
    <div className="border-b border-slate-200 pb-5">
      <h3 className="text-3xl font-semibold leading-6 text-slate-900">
        Latest Changes
      </h3>
    </div>
    {(commits ?? []).map((commit) => (
      <Commit key={commit.message} {...commit} />
    ))}
  </div>
);
