import LandingHero from "@/components/LandingHero/LandingHero";
import { LatestCommits } from "@/components/LatestCommits";
import type { CommitType } from "@/components/LatestCommits/Commit";
import { UseCaseSection } from "@/components/UseCases";
import { WaitListCard } from "@/components/WaitistCard";
import { Space } from "@mantine/core";
import axios from "axios";
import _ from "lodash";
import type { NextPage } from "next";

type HomeProps = {
  commits: CommitType[];
};

const Home: NextPage<HomeProps> = ({ commits }) => (
  <>
    <LandingHero />
    <Space h="lg" />
    <UseCaseSection />
    <Space h="lg" />
    <WaitListCard />
    <Space h="lg" />
    <LatestCommits commits={commits} />
  </>
);

export async function getStaticProps() {
  const commitsFromEachBranch = 8;
  // const allCommits: CommitType[] = []; // TODO enable

  // const { data } = await axios.get(
  //   `https://api.github.com/repos/plutomi/plutomi/commits?sha=main&per_page=${commitsFromEachBranch}&u=joswayski`,
  //   {
  //     // headers: {
  //     //   Authorization: `token ${process.env.COMMITS_TOKEN}`,
  //     // },
  //   }
  // );

  // data.map(async (commit) => {
  //   const isBot = commit.commit.author.name === "allcontributors[bot]";

  //   if (!isBot) {
  //     const customCommit = {
  //       name: commit.commit.author.name,
  //       username: commit.author.login,
  //       image: commit.author.avatar_url,
  //       email: commit.commit.author.email,
  //       date: commit.commit.author.date,
  //       message: commit.commit.message,
  //       url: commit.html_url
  //     };
  //     allCommits.push(customCommit);
  //   }
  // });

  // // Sort by commit timestamp
  // const orderedCommits = _.orderBy(allCommits, (commit) => commit.date, [
  //   "desc"
  // ]);

  // // Remove duplicates
  // const commits = orderedCommits.filter(
  //   (value, index, self) =>
  //     index ===
  //     self.findIndex((t) => t.url === value.url && t.date === value.date)
  // );

  return {
    props: {
      commits: [
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-05-04T13:32:00Z",
          message:
            "Updated readme `env.ts` section, fixing typo (#850)\n\nUpdated readme `env.ts` section, fixing typo",
          url: "https://github.com/plutomi/plutomi/commit/7e045d62b79118e095aa218ea51d07561b0ed042"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-23T06:52:47Z",
          message:
            "Added `@plutomi/env` & `@plutomi/infra` (Fargate, CloudFront, WAF, etc.) packages (#846)\n\n* Added readme to cspell, deleted old yml workflow and added pretty and spellcheck to cacheable nx operations\r\n\r\n* Added fck nat\r\n\r\n* infra for creating a task role and definition\r\n\r\n* VPC construct\r\n\r\n* Created fargate service and cluster\r\n\r\n* More cleanup of the fargate service\r\n\r\n* fargate service scaling policy, closes #830\r\n\r\n* Removed CPU scaling\r\n\r\n* Most of getCertificate, replaced construct with stack\r\n\r\n* Added hosted zone\r\n\r\n* Init shared schema\r\n\r\n* Testing env vars\r\n\r\n* Some cleanup env vars\r\n\r\n* Parsed schema\r\n\r\n* Delted root env, added dotnev to infra\r\n\r\n* Updated env to use stage domain when appropriate, added container port mappings, etc\r\n\r\n* Removed deregistration delay\r\n\r\n* Cleaned up scaling and health checks\r\n\r\n* Cleaned up port mappings and task definition\r\n\r\n* Create waf, need to rename\r\n\r\n* saving before a record\r\n\r\n* Cleaned up distribution and hosted zone\r\n\r\n* Added waf to alb instead\r\n\r\n* Saving\r\n\r\n* created waf at alb, closes #537, closes #835 i think\r\n\r\n* Added nextjs caching, definitely closes #835\r\n\r\n* Added cf header keys and values to infra\r\n\r\n* Cleanup env\r\n\r\n* Updated env packages\r\n\r\n* Fixing a certificate file naming issue\r\n\r\n* fixing issue with .env files and schemas\r\n\r\n* Fixing another issue with acm file name\r\n\r\n* Some env progress\r\n\r\n* More validation\r\n\r\n* Fixed api imports\r\n\r\n* Added readme about env variables\r\n\r\n* Added more refinements\r\n\r\n* Reverted back refinement\r\n\r\n* Strict api validation on env vars\r\n\r\n* Reverted\r\n\r\n* Added infra output\r\n\r\n* Added cors, built infra dir\r\n\r\n* changing some stuff\r\n\r\n* removed build from infra\r\n\r\n* Replaced env\r\n\r\n* Removed infra from api package\r\n\r\n* Removed infra from dockerfile\r\n\r\n* moved dotenv to dev deps\r\n\r\n* Added env file and workspace\r\n\r\n* Setup env package\r\n\r\n* Fixed infra env imports\r\n\r\n* cleaned up package/env to be just for schemas\r\n\r\n* Cleaned up env parsing\r\n\r\n* Added proper env packages\r\n\r\n* Cleaned up schema to make a bit more sense\r\n\r\n* Fixed parser\r\n\r\n* Saving\r\n\r\n* saving cspell\r\n\r\n* Removed defaults from env\r\n\r\n* Adde d note about sample\r\n\r\n* Cleaned up git ignores\r\n\r\n* Fixing sample\r\n\r\n* infra dotenv\r\n\r\n* Fixing docker file dir, fixing env import\r\n\r\n* Deleted waf setup\r\n\r\n* Increased healthcheck interval\r\n\r\n* Excluding certain files and directories from search\r\n\r\n* Fixing docker ignore for deploying from infra\r\n\r\n* removed hsot posrt\r\n\r\n* Cleaned up some infra stuff\r\n\r\n* Added aws region schema, cleaned up port schema\r\n\r\n* Fixing an issue with NX and docker\r\n\r\n* Updating git ignore\r\n\r\n* Added acm certificate id to env vars\r\n\r\n* Added temporary domain for CF, reduced timeout\r\n\r\n* added note about temporary domain, added next public url to dockerfile\r\n\r\n* Made api stack dependant on VPC\r\n\r\n* Fixed ECR connectivity issue\r\n\r\n* Removed cluster\r\n\r\n* Fixing cross compatability when deploying locally\r\n\r\n* Extracted the nat gateway provider piece to its own\r\n\r\n* Updated inbound connections to nat gateways\r\n\r\n* Some cleanup\r\n\r\n* extracted nat gateway provider\r\n\r\n* fixing an issue when deploying from arm\r\n\r\n* Fixing connectivity issue\r\n\r\n* Cleaning up cloudfront cache for nextjs routes\r\n\r\n* added names to some stacks\r\n\r\n* Removed web gitignore\r\n\r\n* Some cleanup\r\n\r\n* Cspell, adding https ports only\r\n\r\n* prettier fix\r\n\r\n* Cleaned up readme\r\n\r\n* Added infra sample\r\n\r\n* Fixups",
          url: "https://github.com/plutomi/plutomi/commit/192310289a22aea2893a8d34146133932c5b3a16"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-21T04:05:46Z",
          message: "Fixing an issue with infinite restarts in dev (#847)",
          url: "https://github.com/plutomi/plutomi/commit/0e917dc4ef27ddebc35735567f87795f0534b471"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-15T07:26:26Z",
          message:
            "Adding badges for actions, updated contributors (#845)\n\n* Updated badges",
          url: "https://github.com/plutomi/plutomi/commit/4d2ec810ab209e4f7eff258d931c405927565ca7"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-15T07:12:25Z",
          message:
            "Run build on PRs (#844)\n\n* Run build on PRs\r\n\r\n* Added prod node_env to github action\r\n\r\n* Added more node_env to other runners\r\n\r\n* renamed prettier\r\n\r\n* Setup node env correctly",
          url: "https://github.com/plutomi/plutomi/commit/8de3bd61b480ccf647ce0bf24f371edb4477c800"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-15T06:58:27Z",
          message:
            "Run prettier on PRs (#843)\n\n* Run prettier on PRs\r\n\r\n* Prettier test\r\n\r\n* Cleanup",
          url: "https://github.com/plutomi/plutomi/commit/a006f308587461962b0e069db9fb9515e968d622"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-15T06:50:20Z",
          message:
            "Linter GitHub Action (#842)\n\n* linter action\r\n\r\n* Added eslint workspace\r\n\r\n* Verified linter is working\r\n\r\n* Added note to readme about workspace file",
          url: "https://github.com/plutomi/plutomi/commit/0110b788bdcfe54fc9e5efbcd741a8ae149a65e2"
        },
        {
          name: "Jose Valerio",
          username: "joswayski",
          image: "https://avatars.githubusercontent.com/u/22891173?v=4",
          email: "contact@josevalerio.com",
          date: "2023-04-15T06:20:41Z",
          message:
            "Spellchecker GitHub Action (#841)\n\n* Action spellcheck\r\n\r\n* Spellcheck branch check\r\n\r\n* Another test\r\n\r\n* Removed example",
          url: "https://github.com/plutomi/plutomi/commit/c0b05fc4ae35f134163ccfad90c0302bd1808573"
        }
      ]
    }
  };
}

export default Home;
