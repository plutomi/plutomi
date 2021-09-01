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
  DocumentIcon,
  DocumentTextIcon,
} from "@heroicons/react/outline";

const features = [
  {
    name: "Open Source",
    icon: CodeIcon,
    color: `bg-gradient-to-br from-cyan-400 to-blue-500`,
    isGithub: true,
    description: "Read, inspect, and contribute to our GitHub repository",
  },
  {
    name: "Never settle",
    icon: ArrowsExpandIcon,
    description: "Unlimited users, applicants, and funnels",
    color: `bg-gradient-to-br from-green-400 to-emerald-500`,
  },

  {
    name: "Third Party Apps",
    icon: ViewGridAddIcon,
    color: `bg-gradient-to-br from-rose-400 to-red-500`,

    description:
      "Seamless integrations with tools like Slack, Zendesk, and Zapier",
  },

  {
    name: "Stay in control",
    icon: LockClosedIcon,
    color: `bg-gradient-to-br from-purple-300 to-violet-500`,
    description: "Role based access to all of your resources + MFA & SSO",
  },
  // {
  //   name: "Messaging",
  //   icon: ChatIcon,
  //   color: `bg-gradient-to-br from-cyan-400 to-blue-500`,
  //   description: "Connect with applicants directly for a personal touch",
  // },
  // {
  //   name: "Trust but verify",
  //   icon: IdentificationIcon,
  //   color: `bg-gradient-to-br from-red-400 to-red-500`,
  //   description: "Background checks & ID verification",
  // },
  // {
  //   name: "E-Signatures",
  //   icon: DocumentTextIcon,
  //   color: `bg-gradient-to-br from-blue-gray-600 to-blue-gray-800`,
  //   description: "Have your applicants sign documents and contracts",
  // },

  // {
  //   name: "E-Signatures",
  //   icon: DocumentTextIcon,
  //   color: `bg-gradient-to-br from-emerald-50 to-teal-100`,
  //   description: "Have your applicants sign documents and contracts",
  // },
];
export default function Features() {
  return (
    <div className="  ">
      <div className="max-w-7xl mx-auto px-4  flex justify-center sm:px-6 lg:px-8">
        <div className="">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className=" relative">
                <dt>
                  <div
                    className={`absolute flex items-center text-black  justify-center h-12 w-12 rounded-md ${feature.color} text-white`}
                  >
                    <feature.icon className="h-6 w-6 " aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-xl leading-6 font-bold text-gray-900">
                    {feature.name}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-lg text-blue-gray-600">
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
