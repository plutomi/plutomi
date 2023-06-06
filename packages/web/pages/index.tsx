import {
  LandingHero,
  LatestCommits,
  UseCaseSection,
  HomepageNavbar,
  WaitListCard,
  type CommitType
} from "@/components";
import { Space } from "@mantine/core";
import axios from "axios";
import _ from "lodash";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { env } from "@/utils";

type HomeProps = {
  commits: CommitType[];
};

const title = "Plutomi - Applicant management at any scale";
const description =
  "Plutomi helps you streamline your application process with automated workflows";
const ogImage = `${env.NEXT_PUBLIC_BASE_URL}/og-image.png`;

// const NavLinks = [
//   // {
//   //   link: "/pricing",
//   //   label: "Pricing",
//   //   links: []
//   // }
// ];

const Home: NextPage<HomeProps> = ({ commits }) => (
  <>
    <Head>
      <title>Plutomi</title>
      <meta name="description" content={description} key="desc" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={env.NEXT_PUBLIC_BASE_URL} />
      <meta property="og:image" content={ogImage} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={env.NEXT_PUBLIC_BASE_URL} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Head>
    <HomepageNavbar />
    <LandingHero />
    <UseCaseSection />
    <Space h="lg" />
    <WaitListCard />
    <Space h="lg" />
    <LatestCommits commits={commits} />
  </>
);

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
