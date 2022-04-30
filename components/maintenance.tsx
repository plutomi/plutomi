import { ChevronRightIcon, MailIcon } from '@heroicons/react/solid';

import * as Time from '../utils/time';
const commits = [
  {
    applicant: {
      name: 'Ricardo Cooper',
      email: 'ricardo.cooper@example.com',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
];

export default function MaintenanceList({ commits }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md mx-auto max-w-5xl">
      <ul role="list" className="divide-y divide-gray-200">
        {commits.map((commit) => (
          <li key={commit.sha}>
            <a
              href={commit.html_url}
              className="block hover:bg-blue-gray-50 transition ease-in-out duration-200"
              target={'_blank'}
              rel="noreferrer"
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    <img className="h-16 w-16 rounded-full" src={commit.author.avatar_url} alt="" />
                  </div>
                  <div className=" flex-wrap items-center min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {commit.commit.author.name} - {commit.author.login}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        <MailIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <span className="truncate">{commit.commit.author.email}</span>
                      </p>
                    </div>
                    <div className="md:block mt-4 md:mt-0">
                      <div>
                        <p className="text-md text-dark">{commit.commit.message}</p>

                        <p className=" mt-4 text-sm text-gray-900">
                          Committed{' '}
                          <time dateTime={commit.commit.author.date}>
                            {Time.relative(commit.commit.author.date)}
                          </time>
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
  );
}
