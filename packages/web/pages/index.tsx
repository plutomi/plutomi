import { LandingHero } from "@/components/LandingHero";
import { LatestCommits } from "@/components/LatestCommits";
import type { CommitType } from "@/components/LatestCommits/Commit";
import { UseCaseSection } from "@/components/UseCases";
import { Space } from "@mantine/core";
import axios from "axios";
import _ from "lodash";
import type { NextPage } from "next";
import { WaitListCard } from "@/components/WaitListCard";

type HomeProps = {
  commits: CommitType[];
};

const Home: NextPage<HomeProps> = ({ commits }) => (
  <>
    <LandingHero />
    <Space h="sm" />
    <UseCaseSection />
    <Space h="lg" />
    <WaitListCard />
    <Space h="lg" />
    <LatestCommits commits={commits} />
  </>
);

export async function getServerSideProps() {
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
}

export default Home;
