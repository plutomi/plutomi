import axios from "axios";
import _ from "lodash";
import { Commit, type CommitType } from "./Commit";

type LatestCommitsProps = {
  commits: CommitType[];
};

export const LatestCommits: React.FC = ({ commits }: LatestCommitsProps) =>
  commits.map((commit) => <Commit {...commit} />);

export async function getStaticProps() {
  const commitsFromEachBranch = 8;
  const allCommits: CommitType[] = []; // TODO enable

  const { data } = await axios.get(
    `https://api.github.com/repos/plutomi/plutomi/commits?sha=main&per_page=${commitsFromEachBranch}&u=joswayski`,
    {
      // headers: {
      //   Authorization: `token ${process.env.COMMITS_TOKEN}`,
      // },
    }
  );

  data.map(async (commit) => {
    const isBot = commit.commit.author.name === "allcontributors[bot]";

    if (!isBot) {
      const customCommit = {
        name: commit.commit.author.name,
        username: commit.author.login,
        image: commit.author.avatar_url,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
        message: commit.commit.message,
        url: commit.html_url
      };
      allCommits.push(customCommit);
    }
  });

  // Sort by commit timestamp
  const orderedCommits = _.orderBy(allCommits, (commit) => commit.date, [
    "desc"
  ]);

  // Remove duplicates
  const commits = orderedCommits.filter(
    (value, index, self) =>
      index ===
      self.findIndex((t) => t.url === value.url && t.date === value.date)
  );

  console.log(`ALL COMMITS`, commits);
  return {
    props: {
      commits
    }
  };
}
