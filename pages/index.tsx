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
    <div className="relative bg-gradient-to-b from-blue-gray-900 to-blue-gray-900 via-blue-gray-800">
      <Popover className="relative bg-white shadow ">
        <div className="md:flex max-w-7xl mx-auto px-4 sm:px-6 justify-center items-center py-4">
          <div className="hidden md:flex justify-around space-x-4   w-1/4 ">
            {navbarLinks.map((link) =>
              link.internal ? (
                <div key={link.name}>
                  <Link href={link.href}>
                    <a className='focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 text-gray-500 hover:text-gray-900 transition ease-in-out duration-300"'>
                      {link.name}
                    </a>
                  </Link>
                </div>
              ) : (
                <div key={link.name}>
                  <a
                    href={link.href}
                    className='focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 text-gray-500 hover:text-gray-900 transition ease-in-out duration-300"'
                  >
                    {link.name}
                  </a>
                </div>
              )
            )}
          </div>
          <div className="-mr-2 -my-2 md:hidden  flex justify-end">
            <Popover.Button className="bg-white   rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400">
              <span className="sr-only">Open menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>

          {/* Navbar*/}
          <Popover.Group
            as="nav"
            className="hidden md:flex justify-between max-w-xl border "
          ></Popover.Group>

          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel
              focus
              className="absolute top-0 inset-x-0 z-10 p-2 transition transform origin-top-right md:hidden"
            >
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
                <div className="pt-5 pb-6 px-5">
                  <div className="flex items-center justify-end">
                    {/* <div>
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-mark-emerald-400.svg"
                      alt="Workflow"
                    />
                  </div> */}
                    <div className="-mr-2">
                      <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400">
                        <span className="sr-only">Close menu</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <nav className="grid gap-y-8">
                      {features.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-100"
                        >
                          <item.icon
                            className="flex-shrink-0 h-6 w-6 text-emerald-400"
                            aria-hidden="true"
                          />
                          <span className="ml-3 text-base font-medium text-gray-900">
                            {item.name}{" "}
                            {item.subHeading ? (
                              <span className="text-gray-400 text-xs">
                                - {item.subHeading}
                              </span>
                            ) : null}
                          </span>
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </div>
      </Popover>

      <main className="">
        <div className="mx-auto max-w-7xl w-full py-16  text-center lg:py-28 lg:text-left">
          <div className="px-4 w-full  flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-white text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-r from-amber-500 to-red-500 rounded-full">
              Coming soon!
            </span>
            <h1 className=" text-4xl xl:inline text-white tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              Applicant management
            </h1>
            <h1 className=" p-1 text-4xl xl:inline  text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-400 via-emerald-500 tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              at any scale
            </h1>
            <p className="mt-3 mx-auto text-xl text-center text-blue-gray-200 sm:text-2xl md:mt-5">
              Plutomi is a platform designed to automate your application
              process.
            </p>
          </div>
        </div>
      </main>

      <section id="features">
        <div className="relative bg-white py-16 sm:py-24 lg:py-16">
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
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  Get in touch
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:mt-0 lg:col-span-2">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">
                      Support
                    </h3>
                    <dl className="mt-2 text-base text-blue-gray-400">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>support@plutomi.com</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">
                      Are you a VC?
                    </h3>
                    <dl className="mt-2 text-base text-blue-gray-400">
                      <div>
                        <dt className="sr-only">Email</dt>
                        <dd>ir@plutomi.com</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-white">
                      General Inquiries
                    </h3>
                    <dl className="mt-2 text-base text-blue-gray-400">
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
