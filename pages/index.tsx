import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MailIcon,
} from "@heroicons/react/solid";
import axios from "axios";
import _ from "lodash";
import Time from "../utils/time";

export default function Main({ commits }) {
  return (
    <div>
      <div className="bg-white overflow-hidden sm:rounded-md mx-auto">
        <div className="bg-white">
          <div className="max-w-7xl mx-auto mt-24  px-4  sm:px-6 lg:px-8 lg:flex lg:justify-between">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl  border-l-8 border-blue-500 pl-4 ">
              Hello there!
            </h2>
          </div>
          <div className="max-w-7xl mx-auto px-4 mb-12 sm:px-6 lg:px-8 lg:flex lg:justify-between">
            <p className="mt-5 text-xl text-gray-500 ">
              We&apos;re currently down for maintenance as we migrate some of
              our backend infrastructure - you can even contribute{" "}
              <a
                href="https://github.com/plutomi/plutomi"
                target={"_blank"}
                rel="noreferrer"
                className="underline font-bold transition ease-in-out duration-300 text-dark hover:text-blue-500"
              >
                on GitHub!
              </a>
            </p>
          </div>
        </div>
        <ul
          role="list"
          className="divide-y mx-auto max-w-7xl divide-gray-200  mt-12"
        >
          {commits.map((commit) => (
            <li
              key={commit.email}
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
                          <MailIcon
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          <span className="truncate">{commit.email}</span>
                        </p>
                      </div>
                      <div className="">
                        <div>
                          <p className="text-lg text-gray-900">
                            Committed {Time.relative(commit.date)}
                          </p>
                          <p className="mt-2 flex items-center text-lg text-gray-500">
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
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const commitsFromEachBranch = 100;
  let allCommits = [];
  const { data } = await axios.get(
    `https://api.github.com/repos/plutomi/plutomi/branches?u=joswayski`
  );

  await Promise.all(
    data.map(async (branch) => {
      const { data } = await axios.get(
        `https://api.github.com/repos/plutomi/plutomi/commits?sha=${branch.name}&per_page=${commitsFromEachBranch}&u=joswayski`
      );

      data.map(async (commit) => {
        let customCommit = {
          name: commit.commit.author.name,
          username: commit.author.login,
          image: commit.author.avatar_url,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
          message: commit.commit.message,
          url: commit.html_url,
        };
        allCommits.push(customCommit);
      });
    })
  );

  // Sort by commit timestamp
  const commits = _.orderBy(allCommits, (commit) => commit.date, ["desc"]);

  return {
    props: {
      commits,
    },
  };
}
