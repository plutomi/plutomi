import { orderBy } from "lodash";
import { Commit, type CommitType } from "./Commit";

async function getCommits() {
  const commitsFromEachBranch = 8;
  const allCommits: CommitType[] = [];

  await new Promise((resolve) =>
    setTimeout(() => resolve("Loading finished"), 5000)
  );

  const res = await fetch(
    `https://api.github.com/repos/plutomi/plutomi/commits?sha=main&per_page=${commitsFromEachBranch}&u=joswayski`
  );

  const data = await res.json();

  data.map(
    async (commit: {
      commit: { author: { name: string; email: any; date: any }; message: any };
      author: { login: any; avatar_url: any };
      html_url: any;
    }) => {
      const author = commit.author.login;
      const isBot =
        author === "allcontributors[bot]" || author === "dependabot[bot]";

      if (!isBot) {
        const customCommit = {
          name: author,
          username: author,
          image: commit.author.avatar_url,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          message: commit.commit.message.substring(0, 250),
          url: commit.html_url
        };
        allCommits.push(customCommit);
      }
    }
  );

  // Sort by commit timestamp
  const orderedCommits = orderBy(allCommits, (commit) => commit.date, ["desc"]);

  // Remove duplicates
  const commits = orderedCommits.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.url === value.url && t.date === value.date)
  );

  return commits;
}

export default async function LatestCommits() {
  const commits = await getCommits();

  return (
    <div className="w-full max-w-3xl space-y-3 flex flex-col justify-center px-4 lg:px-0">
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
}
