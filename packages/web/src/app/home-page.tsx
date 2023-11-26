import { type CommitType, LatestCommits } from "../components";
type HomeProps = {
  commits: CommitType[];
};

export default function HomePage({ commits }: HomeProps) {
  const x = "";

  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center">
        <div className="mt-12">
          <LatestCommits commits={commits} />
        </div>
      </div>
    </div>
  );
}
