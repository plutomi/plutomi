import {
  ArrowsExpandIcon,
  CodeIcon,
  LockClosedIcon,
  ViewGridAddIcon,
} from '@heroicons/react/outline';
import { CustomLink } from '../CustomLink';

const features = [
  {
    name: 'Open Source',
    icon: CodeIcon,
    color: `bg-gradient-to-br from-cyan-400 to-blue-500`,
    isGithub: true,
    description: 'Read, inspect, and contribute to our GitHub repository',
  },
  {
    name: 'Never settle',
    icon: ArrowsExpandIcon,
    description: 'Unlimited users, applicants, and openings',
    color: `bg-gradient-to-br from-green-400 to-emerald-500`,
  },

  {
    name: 'Third Party Apps',
    icon: ViewGridAddIcon,
    color: `bg-gradient-to-br from-rose-400 to-red-500`,

    description: 'Easy integrations with tools like Slack and Zendesk',
  },

  {
    name: 'Stay in control',
    icon: LockClosedIcon,
    color: `bg-gradient-to-br from-purple-300 to-violet-500`,
    description: 'Role based access to all of your resources',
  },
];

export const Features = () => (
  <div className="py-14 ">
    <div className="max-w-7xl mx-auto px-4  flex justify-center sm:px-6 lg:px-8">
      <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
        {features.map((feature) => (
          <div key={feature.name} className=" relative">
            <dt>
              <div
                className={`absolute flex items-center text-black  justify-center h-12 w-12 rounded-md ${feature.color} text-white`}
              >
                <feature.icon className="h-6 w-6 " aria-hidden="true" />
              </div>
              <p className="ml-16 text-xl leading-6 font-bold text-dark">{feature.name}</p>
            </dt>
            <dd className="mt-2 ml-16 text-xl text-normal">
              {feature.isGithub ? (
                <p>
                  Read, inspect, and contribute to{' '}
                  <CustomLink
                    url="https://github.com/plutomi/plutomi"
                    text="our GitHub repository"
                  />
                </p>
              ) : (
                feature.description
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </div>
);
