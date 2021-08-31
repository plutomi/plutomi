/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import Pricing from "../components/Pricing";
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

export default function Main() {
  return (
    <div className="relative bg-blue-gray-900">
      <main>
        <div className="mx-auto max-w-7xl w-full py-24  text-center lg:py-28 mb-24 lg:mb-28 lg:text-left">
          <div className="px-4 w-full  flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-white text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-r from-amber-500 to-red-500 rounded-full">
              Coming soon!
            </span>
            <h1 className=" text-4xl xl:inline text-white tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              Applicant management
            </h1>
            <h1 className=" p-1 text-4xl xl:inline text-white text-emerald tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              at any scale
            </h1>
            <p className="mt-3 mx-auto text-xl text-center text-blue-gray-100 sm:text-2xl md:mt-5">
              Plutomi automates your entire application process with streamlined
              workflows
            </p>
          </div>
        </div>
      </main>
      <section className="relative">
        <div className="custom-shape-divider-bottom-1630375669">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="shape-fill"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="shape-fill"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <section id="features" className="border-b">
        <FeatureBox />
      </section>
      <section>
        <Pricing />
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
                    <h3 className="text-lg leading-6 font-bold text-white">
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
                    <h3 className="text-lg leading-6 font-bold text-white">
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
                    <h3 className="text-lg leading-6 font-bold text-white">
                      General Inquiries
                    </h3>
                    <dl className="mt-2 text-blue-gray-400">
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
