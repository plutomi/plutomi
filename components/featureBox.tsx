/* This example requires Tailwind CSS v2.0+ */
import {
  CodeIcon,
  ViewGridAddIcon,
  FilterIcon,
} from "@heroicons/react/outline";

const features = [
  {
    name: "Painless Filtering",
    description:
      "Move applicants to specific stages based on their previous responses.",
    icon: FilterIcon,
    color: `bg-gradient-to-br from-teal-400 to-emerald-500`,
    link: null,
  },
  {
    name: "Open Source",
    description:
      "Full transparency. Read, inspect, and contribute to our GitHub repository.",
    icon: CodeIcon,
    color: `bg-gradient-to-br from-amber-500 to-red-500`,
    link: `https://github.com/plutomi/plutomi`,
  },

  {
    name: "Third Party Apps",
    description:
      "Easy integrations with tools like Slack, Zendesk, Checkr, and Zapier.",
    icon: ViewGridAddIcon,
    color: `bg-gradient-to-br from-teal-400 to-emerald-500`,
    link: null,
  },
];

export default function FeatureBox() {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => {
        return (
          <a
            key={feature.name}
            href={feature.link}
            target="_blank"
            rel="noreferrer"
          >
            <div className="pt-6 ">
              <div className="flex flex-col justify-center items-center shadow-sm hover:shadow-md border transition ease-in-out duration-300 bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <span
                    className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-md shadow-lg`}
                  >
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight ">
                    {feature.name}
                  </h3>
                  <p className="mt-5 text-center text-gray-500 max-w-full ">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
