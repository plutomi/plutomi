// Import your Client Component
import { orderBy } from "lodash";
import HomePage from "./home-page";
import axios from "axios";
import { CommitType } from "./commit";

async function getCommits() {
  const commitsFromEachBranch = 8;
  const allCommits: CommitType[] = [];

  const { data } = await axios.get(
    // TODO: Remove joswayski username
    `https://api.github.com/repos/plutomi/plutomi/commits?sha=main&per_page=${commitsFromEachBranch}&u=joswayski`,
    {
      // headers: {
      //   Authorization: `token ${process.env.COMMITS_TOKEN}`,
      // },
    }
  );

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
export default async function Page() {
  // Fetch data directly in a Server Component
  const commits = await getCommits();
  // Forward fetched data to your Client Component
  return <HomePage commits={commits} />;
}
