import _ from "lodash";
import { nanoid } from "nanoid";
import axios from "axios";
import { EnvelopeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Hero } from "../components/Hero";
import { UseCaseList } from "../components/UseCaseList";
import { Notified } from "../components/Notified";

type Commit = {
  url: string;
  username: string;
  name: string;
  image: string;
  date: Date;
  email: string;
  message: string;
};

type HomepageProps = {
  commits: Commit[];
};

//
const enhancementText = `To enhance the long term stability of the site, I (Jose) am doing
a major refactor. You can check the progress and all changes on
GitHub or DM me on Twitter or by email if you have any questions
:)`;

const myEmail = "jose@plutomi.com";

const Main = ({ commits }: HomepageProps) => {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const siteIsCurrent = `This site is current as of ${today}`;
  return (
    <div className="bg-white">
      <Hero />
      <Notified />
      <UseCaseList />

      <div className="flex-wrap md:flex  justify-center space-x-2">
        <ul className="divide-y mx-auto max-w-4xl divide-gray-200  mt-12">
          {/* {commits.map((commit) => (
            <li
              key={nanoid(15)}
              className="transition ease-in-out duration-200 hover:bg-blue-gray-50"
            >
              <a href={commit.url} className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-full"
                        src={commit.image}
                        alt=""
                      />
                    </div>
                    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                      <div className="">
                        <p className="text-lg font-medium text-indigo-600 truncate">
                          {commit.name} - {commit.username}
                        </p>
                        <p className="mt-2 flex items-center text-lg text-gray-500">
                          <EnvelopeIcon
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="truncate">{commit.email}</span>
                        </p>
                      </div>
                      <div className="py-2 overflow-auto">
                        <div>
                          <p className="text-lg text-gray-900">
                            Committed{" "}
                            {new Date(commit.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </p>
                          <p className="mt-2 flex items-center text-lg text-gray-500 whitespace-pre-line">
                            {commit.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChevronRightIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </a>
            </li>
          ))} */}
        </ul>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
        <div className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
          <div className="space-y-4 text-md leading-6 text-gray-900">
            <p className="">{enhancementText}</p>

            <p>{myEmail}</p>
            <p>{siteIsCurrent}</p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://github.com/plutomi/plutomi"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-white border border-gray-500  px-3.5 py-2.5 text-xs lg:text-sm font-semibold text-gray-900 shadow-sm  hover:bg-gray-900 hover:text-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Plutomi on GitHub
            </a>
            <a
              href="https://twitter.com/notjoswayski"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-100 hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Jose on Twitter
            </a>
          </div>
        </div>
      </div>

      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-12 text-center shadow-2x sm:px-16">
        <p className="mx-auto  max-w-xl text-xl leading-8 text-gray-300">
          {enhancementText}
        </p>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          {myEmail}
        </p>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          {siteIsCurrent}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="https://github.com/plutomi/plutomi"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-white border-2  px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm  hover:bg-gray-900 hover:text-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Plutomi on GitHub
          </a>
          <a
            href="https://twitter.com/notjoswayski"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-100 hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Jose on Twitter
          </a>
        </div>
        <svg
          viewBox="0 0 1024 1024"
          className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
          aria-hidden="true"
        >
          <circle
            cx={512}
            cy={512}
            r={512}
            fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
            fillOpacity="0.7"
          />
          <defs>
            <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
              <stop stopColor="#7775D6" />
              <stop offset={1} stopColor="#E935C1" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

// export async function getStaticProps() {
//   const commitsFromEachBranch = 8;
//   const allCommits: Array<Record<string, string>> = []; // TODO enable

//   const { data } = await axios.get(
//     `https://api.github.com/repos/plutomi/plutomi/commits?sha=main&per_page=${commitsFromEachBranch}&u=joswayski`,
//     {
//       // headers: {
//       //   Authorization: `token ${process.env.COMMITS_TOKEN}`,
//       // },
//     }
//   );

//   // @ts-expect-error
//   data.map(async (commit) => {
//     const isBot = commit.commit.author.name === "allcontributors[bot]";

//     if (!isBot) {
//       const customCommit = {
//         name: commit.commit.author.name,
//         username: commit.author.login,
//         image: commit.author.avatar_url,
//         email: commit.commit.author.email,
//         date: commit.commit.author.date,
//         message: commit.commit.message,
//         url: commit.html_url
//       };
//       allCommits.push(customCommit);
//     }
//   });

//   // Sort by commit timestamp
//   // @ts-expect-error
//   const orderedCommits = _.orderBy(
//     allCommits,
//     (commit: Object) => commit.date,
//     ["desc"]
//   );

//   // @ts-expect-error
//   const commits = orderedCommits.filter(
//     // @ts-expect-error
//     (value, index, self) =>
//       index ===
//       // @ts-expect-error
//       self.findIndex((t) => t.url === value.url && t.date === value.date)
//   );

//   return {
//     props: {
//       commits
//     }
//   };
// }

export default Main;
