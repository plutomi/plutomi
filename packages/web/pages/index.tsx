import {
  type CommitType,
  LatestCommits,
  LandingHero,
  UseCaseSection,
  WaitListCard
} from "@/components";
import { HomepageFooter } from "@/components/HomepageFooter";
import axios from "axios";
import _ from "lodash";
import type { GetStaticProps, NextPage } from "next";

type HomeProps = {
  commits: CommitType[];
};

const Home: NextPage<HomeProps> = ({ commits }) => (
  <div className="w-full h-full flex justify-center">
    <div className="flex flex-col my-32  items-center">
      <LandingHero />
      <div className="w-full flex justify-center">
        <UseCaseSection />
      </div>

      <div className="mt-12">
        <WaitListCard />
      </div>
      <div className="mt-12">
        <LatestCommits commits={commits} />
      </div>
      <div className=" w-full mt-12 flex justify-center">
        <HomepageFooter />
      </div>
    </div>
  </div>
);

// Note: Pages WITHOUT getStaticProps will be server-side rendered
// Due to _getInitialProps in _document.tsx
// https://nextjs.org/docs/messages/opt-out-auto-static-optimization
export const getStaticProps: GetStaticProps = async () => {
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

  // TODO: Add types
  data.map(
    async (commit: {
      commit: { author: { name: string; email: any; date: any }; message: any };
      author: { login: any; avatar_url: any };
      html_url: any;
    }) => {
      const author: string = commit.author.login;

      if (!author.includes("[bot]")) {
        const customCommit = {
          name: author,
          username: commit.author.login,
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
