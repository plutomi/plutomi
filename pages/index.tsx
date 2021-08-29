/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  BookmarkAltIcon,
  CalendarIcon,
  MenuIcon,
  PhoneIcon,
  PlayIcon,
  MapIcon,
  ShieldCheckIcon,
  SupportIcon,
  BookOpenIcon,
  XIcon,
} from "@heroicons/react/outline";
import FeatureBox from "../components/featureBox";
import Link from "next/dist/client/link";
const features = [
  {
    name: "Blog",
    subHeading: "Coming Soon",
    newTab: false,
    href: "https://plutomi.com/blog",
    description:
      "Keep up with the latest changes and read stories by the engineering team",
    icon: BookOpenIcon,
  },

  {
    name: "Public Roadmap",
    subHeading: "Coming Soon",
    newTab: true,
    href: "https://github.com/plutomi/plutomi/projects/1",
    description:
      "Request features and vote on which ones should be implemented next",
    icon: MapIcon,
  },
];
const callsToAction = [
  { name: "Watch Demo", href: "#", icon: PlayIcon },
  { name: "Contact Sales", href: "#", icon: PhoneIcon },
];
const resources = [
  {
    name: "Help Center",
    description:
      "Get all of your questions answered in our forums or contact support.",
    href: "#",
    icon: SupportIcon,
  },
  {
    name: "Guides",
    description:
      "Learn how to maximize our platform to get the most out of it.",
    href: "#",
    icon: BookmarkAltIcon,
  },
  {
    name: "Events",
    description:
      "See what meet-ups and other events we might be planning near you.",
    href: "#",
    icon: CalendarIcon,
  },
  {
    name: "Security",
    description: "Understand how we take your privacy seriously.",
    href: "#",
    icon: ShieldCheckIcon,
  },
];
const recentPosts = [
  { id: 1, name: "Boost your conversion rate", href: "#" },
  {
    id: 2,
    name: "How to use search engine optimization to drive traffic to your site",
    href: "#",
  },
  { id: 3, name: "Improve your customer experience", href: "#" },
];

const navbarLinks = [
  {
    name: "Blog",
    href: "/blog",
    internal: true,
  },
  {
    name: "Roadmap",
    href: "https://github.com/plutomi/plutomi/projects/1",
  },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  return (
    <div className="relative bg-white">
      <main className="border-b">
        <div className="mx-auto max-w-7xl w-full py-16  text-center lg:py-28 lg:text-left">
          <div className="px-4 w-full  flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-white text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-r from-amber-500 to-red-500 rounded-full">
              Coming soon!
            </span>
            <h1 className=" text-4xl xl:inline text-blue-gray-900 tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              Applicant management
            </h1>
            <h1 className=" p-1 text-4xl xl:inline  text-emerald tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              at any scale
            </h1>
            <p className="mt-3 mx-auto text-xl text-center text-warm-gray-500 sm:text-2xl md:mt-5">
              Plutomi streamlines your entire application process with automated
              workflows
            </p>
          </div>
        </div>
      </main>

      <section id="features">
        <div className="relative bg-cool-gray-50 py-16 sm:py-24 lg:py-16">
          {" "}
          <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
            <FeatureBox />
          </div>
        </div>
      </section>
      <section id="contact">
        <div className=" border-t">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
            <div className="divide-y-2 divide-gray-200">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <h2 className="text-2xl font-extrabold text-blue-gray-900 sm:text-3xl">
                  Get in touch
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-0 lg:col-span-2">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-blue-gray-900">
                      Support
                    </h3>
                    <dl className="mt-2 text-base text-warm-gray-500">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>support@plutomi.com</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-blue-gray-900">
                      Are you a VC?
                    </h3>
                    <dl className="mt-2 text-base text-warm-gray-500">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>ir@plutomi.com</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-blue-gray-900">
                      General Inquiries
                    </h3>
                    <dl className="mt-2 text-base text-warm-gray-500">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>contact@plutomi.com</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
