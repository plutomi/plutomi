/* This example requires Tailwind CSS v2.0+ */
import {
  AnnotationIcon,
  GlobeAltIcon,
  LightningBoltIcon,
  ScaleIcon,
  ArrowsExpandIcon,
  IdentificationIcon,
  CodeIcon,
  LockClosedIcon,
  ChatIcon,
  ViewGridAddIcon,
} from "@heroicons/react/outline";

const features = [
  {
    name: "Never settle",
    icon: ArrowsExpandIcon,
    description: "Unlimited users, applicants, and funnels.",
    color: `bg-gradient-to-br from-cyan-400 to-sky-500`,
  },
  {
    name: "Open Source",
    icon: CodeIcon,
    color: `bg-gradient-to-br from-teal-400 to-emerald-500`,
    isGithub: true,
    description: "Read, inspect, and contribute to our GitHub repository",
  },
  {
    name: "Third Party Apps",
    icon: ViewGridAddIcon,
    color: `bg-gradient-to-br from-indigo-400 to-violet-500`,
    description:
      "Seamless integrations with tools like Slack, Zendesk, and Zapier",
  },
  {
    name: "Stay in control",
    icon: LockClosedIcon,
    color: `bg-gradient-to-br from-blue-gray-600 to-warm-gray-800`,
    description:
      "Role based access to all of your resources. MFA & SSO included",
  },
  {
    name: "Messaging",
    icon: ChatIcon,
    color: `bg-gradient-to-br from-rose-400 to-red-500`,
    description: "Connect with applicants directly for a personal touch",
  },
  {
    name: "Trust but verify",
    icon: IdentificationIcon,
    color: `bg-gradient-to-br from-yellow-400 to-amber-500`,

    description: "Background checks & ID verification available",
  },
];
export default function Features() {
  return (
    <div className="py-6 bg-white ">
      <div className="max-w-7xl mx-auto px-4  flex justify-center sm:px-6 lg:px-8">
        <div className="">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className=" relative">
                <dt>
                  <div
                    className={`absolute flex items-center justify-center h-12 w-12 rounded-md ${feature.color} text-white`}
                  >
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.isGithub ? (
                    <p>
                      Read, inspect, and contribute to{" "}
                      <a
                        href="https://github.com/plutomi/plutomi"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-gray-900 font-medium hover:text-blue-500 transition ease-in-out duration-300"
                      >
                        our GitHub repository
                      </a>
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
    </div>
  );
}
