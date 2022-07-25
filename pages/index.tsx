import _ from 'lodash';
import { ChevronRightIcon, MailIcon } from '@heroicons/react/outline';
import { nanoid } from 'nanoid';
import { useSelf } from '../SWR/useSelf';
import { AXIOS_INSTANCE as axios, DOMAIN_NAME } from '../Config';
import { ContactUs } from '../components/ContactUs';
import { Hero } from '../components/Hero';
import { LoginHomepage } from '../components/LoginHomepage';
import { AlreadyLoggedIn } from '../components/AlreadyLoggedIn';
import { UseCaseList } from '../components/UseCaseList';
import * as Time from '../utils/time';

interface Commit {
  url: string;
  username: string;
  name: string;
  image: string;
  date: Date;
  email: string;
  message: string;
}

interface HomepageProps {
  commits: Commit[];
}
// TODO types

export default function Main({ commits }: HomepageProps) {
  const { user, isUserLoading, isUserError } = useSelf();
  return (
    <>
      <main className="bg-gradient-to-b from-blue-gray-50 to-white via-homepageGradient">
        <Hero />
        {!user || isUserError ? (
          <LoginHomepage
            callbackUrl={`${DOMAIN_NAME}/dashboard`} // TODO fallback url is already set im pretty sure
          />
        ) : (
          <AlreadyLoggedIn />
        )}
      </main>
      <div className="flex-wrap md:flex  justify-center space-x-2">
        <UseCaseList />
        <ul className="divide-y mx-auto max-w-4xl divide-gray-200  mt-12">
          {commits.map((commit) => (
            <li
              key={nanoid(15)}
              className="transition ease-in-out duration-200 hover:bg-blue-gray-50"
            >
              <a href={commit.url} className="block hover:bg-gray-50">
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-16 w-16 rounded-full" src={commit.image} alt="" />
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
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ContactUs />
    </>
  );
}

export async function getStaticProps() {
  const commitsFromEachBranch = 25;
  const allCommits = [];
  const { data } = await axios.get(
    `https://api.github.com/repos/plutomi/plutomi/branches?u=joswayski`,
  );

  await Promise.all(
    data.map(async (branch) => {
      const { data } = await axios.get(
        `https://api.github.com/repos/plutomi/plutomi/commits?sha=${branch.name}&per_page=${commitsFromEachBranch}&u=joswayski`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        },
      );

      data.map(async (commit) => {
        if (commit.commit.author.name !== 'allcontributors[bot]') {
          const customCommit = {
            name: commit.commit.author.name,
            username: commit.author.login,
            image: commit.author.avatar_url,
            email: commit.commit.author.email,
            date: commit.commit.author.date,
            message: commit.commit.message,
            url: commit.html_url,
          };
          allCommits.push(customCommit);
        }
      });
    }),
  );

  // Sort by commit timestamp
  const orderedCommits = _.orderBy(allCommits, (commit) => commit.date, ['desc']);

  // Remove duplicates
  const commits = orderedCommits.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.url === value.url && t.date === value.date),
  );
  return {
    props: {
      commits,
    },
  };
}
