/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  BookmarkAltIcon,
  CalendarIcon,
  ChartBarIcon,
  CursorClickIcon,
  MenuIcon,
  PhoneIcon,
  PlayIcon,
  RefreshIcon,
  MapIcon,
  ShieldCheckIcon,
  SupportIcon,
  ViewGridIcon,
  CodeIcon,
  SparklesIcon,
  BookOpenIcon,
  XIcon,
} from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import Link from "next/dist/client/link";
const features = [
  {
    name: "Open Source",
    subHeading: null,
    newTab: true,
    href: "https://github.com/plutomi/plutomi",
    description: "Read, inspect, and contribute to our GitHub repository",
    icon: CodeIcon,
  },
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
  {
    name: "Domains for sale",
    subHeading: null,
    newTab: false,
    href: "/domains",
    description: "See if your next abandoned project is here ;)",
    icon: SparklesIcon,
  },
  // {
  //   name: "Integrations",
  //   href: "#",
  //   description: "Connect with third-party tools that you're already using.",
  //   icon: ViewGridIcon,
  // },
  // {
  //   name: "Automations",
  //   href: "#",
  //   description:
  //     "Build strategic funnels that will drive your customers to convert",
  //   icon: RefreshIcon,
  // },
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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  return (
    <div className="relative bg-blue-gray-900">
      <Popover className="relative bg-white shadow ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-end md:justify-center items-center py-6 ">
            {/* <div className="flex justify-start lg:w-0 lg:flex-1"> LOGO navbar
              <a href="#">
                <span className="sr-only">Plutomi</span>

                <img 
                  className="h-8 w-auto sm:h-10"
                  src="https://tailwindui.com/img/logos/workflow-mark-emerald-400.svg"
                  alt=""
                />
              </a>
            </div> */}
            <div className="-mr-2 -my-2 md:hidden">
              <Popover.Button className="bg-white   rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400">
                <span className="sr-only">Open menu</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>

            {/* Navbar. Set to hidden by default, md:flex to show */}
            <Popover.Group as="nav" className="hidden md:flex space-x-10">
              {" "}
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        open ? "text-gray-900" : "text-gray-500",
                        "group bg-white   rounded-md inline-flex items-center  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
                      )}
                    >
                      <span className="text-base font-medium group-hover:text-gray-900 transition ease-in-out duration-300">
                        Community
                      </span>
                      <ChevronDownIcon
                        className={classNames(
                          open ? "text-gray-600" : "text-gray-400",
                          " h-5 w-5 group-hover:text-gray-900 transition ease-in-out duration-300"
                        )}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute -ml-4  mt-3 transform z-10 px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                        <div className=" rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className=" grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            {features.map((item) =>
                              item.name === "Domains for sale" ? null : (
                                <a
                                  key={item.name}
                                  href={item.href}
                                  target={item.newTab ? "_blank" : null}
                                  rel="noreferrer"
                                  className="-m-3 p-3 flex items-start rounded-lg transition duration-200 ease-in-out hover:bg-gray-100"
                                >
                                  <item.icon
                                    className="flex-shrink-0 h-6 w-6 text-emerald-400"
                                    aria-hidden="true"
                                  />
                                  <div className="ml-4">
                                    <p className="text-base font-medium text-gray-900">
                                      {item.name}{" "}
                                      {item.subHeading ? (
                                        <span className="text-gray-400 text-xs">
                                          - {item.subHeading}
                                        </span>
                                      ) : null}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {item.description}
                                    </p>
                                  </div>
                                </a>
                              )
                            )}
                          </div>
                          <div className="px-2 py-5 border-tspace-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-2  flex justify-center bg-gray-100">
                            <p className=" text-gray-900  rounded-md text-base font-medium">
                              Also follow{" "}
                              <a
                                href="https://twitter.com/plutomihq"
                                rel="noreferrer"
                                target="_blank"
                                className="text-blue-500 transition ease-in-out duration-300 hover:text-blue-600"
                              >
                                @PlutomiHQ
                              </a>{" "}
                              on Twitter!
                            </p>
                            {/* {callsToAction.map((item) => (
                              <div key={item.name} className="flow-root">
                                <a
                                  href={item.href}
                                  className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                                >
                                  <item.icon
                                    className="flex-shrink-0 h-6 w-6 text-gray-400"
                                    aria-hidden="true"
                                  />
                                  <span className="ml-3">{item.name}</span>
                                </a>
                              </div>
                            ))} */}
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <Link href="/domains">
                <a className="text-base font-medium text-gray-500 hover:text-gray-900 transition ease-in-out duration-300">
                  Domains for sale
                </a>
              </Link>
              {/* 
              <a
                href="#"
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Docs
              </a> */}
              {/* <Popover className="relative">
                {({ open }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        open ? "text-gray-900" : "text-gray-500",
                        "group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400"
                      )}
                    >
                      <span>More</span>
                      <ChevronDownIcon
                        className={classNames(
                          open ? "text-gray-600" : "text-gray-400",
                          "ml-2 h-5 w-5 group-hover:text-gray-500"
                        )}
                        aria-hidden="true"
                      />
                    </Popover.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute left-1/2 z-10 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0">
                        <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                          <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                            {resources.map((item) => (
                              <a
                                key={item.name}
                                href={item.href}
                                className="-m-3 p-3 flex items-start rounded-lg hover:bg-white"
                              >
                                <item.icon
                                  className="flex-shrink-0 h-6 w-6 text-emerald-400"
                                  aria-hidden="true"
                                />
                                <div className="ml-4">
                                  <p className="text-base font-medium text-gray-900">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {item.description}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                          <div className="px-5 py-5 bg-white sm:px-8 sm:py-8">
                            <div>
                              <h3 className="text-sm tracking-wide font-medium text-gray-500 uppercase">
                                Recent Posts
                              </h3>
                              <ul role="list" className="mt-4 space-y-4">
                                {recentPosts.map((item) => (
                                  <li
                                    key={item.id}
                                    className="text-base truncate"
                                  >
                                    <a
                                      href={item.href}
                                      className="font-medium text-gray-900 hover:text-gray-700"
                                    >
                                      {item.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-5 text-sm">
                              <a
                                href="#"
                                className="font-medium text-emerald-400 hover:text-emerald-400"
                              >
                                {" "}
                                View all posts{" "}
                                <span aria-hidden="true">&rarr;</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover> */}
            </Popover.Group>
            {/* <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <a
                href="#"
                className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
              >
                Sign in
              </a>
              <a
                href="#"
                className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-400 hover:bg-emerald-700"
              >
                Sign up
              </a>
            </div> */}
          </div>
        </div>

        {/* Unused below this line */}
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
              {/* <div className="py-6 px-5 space-y-6"> */}
              {/* <div className="grid grid-cols-2 gap-y-4 gap-x-8"> */}
              {/* <a
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Pricing
                  </a>

                  <a
                    href="#"
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    Docs
                  </a> */}
              {/* {resources.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-base font-medium text-gray-900 hover:text-gray-700"
                    >
                      {item.name}
                    </a>
                  ))} */}
              {/* </div> */}
              {/* <div>
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-emerald-400 hover:bg-emerald-700"
                  >
                    Sign up
                  </a>
                  <p className="mt-6 text-center text-base font-medium text-gray-500">
                    Existing customer?
                    <a
                      href="#"
                      className="text-emerald-400 hover:text-emerald-400"
                    >
                      Sign in
                    </a>
                  </p>
                </div> */}
              {/* </div> */}
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>

      <main className="lg:relative">
        <div className="mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
          <div className="px-4 w-full flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-white text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-r from-amber-500 to-red-500 rounded-full">
              Coming soon!
            </span>
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              <span className="block xl:inline text-white">
                Applicant management
              </span>{" "}
              <span className="block text-emerald-400 xl:inline">
                at any scale
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-blue-gray-200 sm:text-xl md:mt-5 md:max-w-6xl">
              Plutomi provides automated workflows to easily manage your
              applicants for hiring, events, and programs
            </p>
            {/* <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-400 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-400 bg-white hover:bg-white md:py-4 md:text-lg md:px-10"
                >
                  Live demo
                </a>
              </div>
            </div> */}
          </div>
        </div>
        {/* <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2102&q=80"
            alt=""
          />
        </div> */}
      </main>
      <section id="features">
        <div className="relative bg-white py-16 sm:py-24 lg:py-16">
          <div className="mx-auto max-w-md px-4 text-center sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
            <h3 className="text-4xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Designed for the modern economy
            </h3>
            <p className="mt-5  mx-auto text-xl text-gray-500">
              No predatory sales pitches or long term contracts. Fully
              customizable and{" "}
              <a
                className="font-bold text-blue-500 transition ease-in-out duration-300 hover:text-blue-600"
                href="https://github.com/plutomi/plutomi"
                target="_blank"
                rel="noreferrer"
              >
                open source
              </a>
              .
            </p>

            <div className="mt-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6 ">
                  {/* Card 1 */}
                  <div className="flow-root shadow-sm hover:shadow-md border transition ease-in-out duration-300 bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-md shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Global Server Network
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Edge computing for fast response times anywhere in the
                        world.
                        <a
                          href="https://uptime.is/three-nines"
                          rel="noreferrer"
                          className="font-bold text-blue-500 transition ease-in-out duration-300 hover:text-blue-600"
                          target="_blank"
                        >
                          <strong> 99.9% SLA</strong>
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 ">
                  {/* Card 2 */}
                  <div className="flow-root shadow-sm hover:shadow-md border transition ease-in-out duration-300 bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-500 to-red-500 rounded-md shadow-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          ></path>
                        </svg>
                      </span>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Safe &amp; Secure
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Encryption at rest &amp; role-based access to all of
                        your resources. SSO and MFA included.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6 ">
                  {/* Card 3 */}
                  <div className="flow-root shadow-sm hover:shadow-md border transition ease-in-out duration-300 bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-md shadow-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-6 w-6 text-white"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            ></path>
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        Developer Friendly API
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        Easy automation &amp; first party integration with tools
                        like Slack, Zendesk, and Zapier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="contact">
        <div className="bg-blue-gray-900 border-t">
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
