import {
  type CommitType,
  LatestCommits,
  LandingHero,
  UseCaseSection
} from "@/components";
import axios from "axios";
import _ from "lodash";
import type { GetStaticProps, NextPage } from "next";

type HomeProps = {
  commits: CommitType[];
};

const Home: NextPage<HomeProps> = ({ commits }) => {
  const x = "";
  return (
    <div className="w-full h-full flex justify-center">
      <div className="flex flex-col my-32  items-center">
        <LandingHero />
        <div className="w-full flex justify-center">
          <UseCaseSection />
        </div>

        <div className="mt-24">
          <LatestCommits commits={commits} />d
        </div>
      </div>
    </div>
  );
};

// Note: Pages WITHOUT getStaticProps will be server-side rendered
// Due to _getInitialProps in _document.tsx
// https://nextjs.org/docs/messages/opt-out-auto-static-optimization
export const getStaticProps: GetStaticProps = async () => {
  const commitsFromEachBranch = 8;
  const allCommits: CommitType[] = [];

  const { data } = await axios.get(
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
    }
  );

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

  return {
    props: {
      commits
    }
  };
};

export default Home;
