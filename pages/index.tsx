/* This example requires Tailwind CSS v2.0+ */
import NewPricing from "../components/Pricing";
import Contact from "../components/ContactUs";
import FeatureBox from "../components/featureBox";
import { useRouter } from "next/router";
import Navbar from "../components/navbar";
import axios from "axios";
import Link from "next/dist/client/link";
import { useCookies } from "react-cookie";
import { ReactEventHandler, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/outline";
export default function Main() {
  const router = useRouter();
  const [user_email, setUserEmail] = useState("");
  const [login_code, setLoginCode] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    "is_logged_in",
    "next_iron_session",
  ]);

  const sendCode = async (e) => {
    e.preventDefault();
    const body = {
      user_email: user_email,
    };

    try {
      const { status, data } = await axios.post("/api/auth/login-code", body);
      setFormSubmitted(true);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    const body = {
      user_email: user_email,
      login_code: login_code,
    };

    try {
      const { status, data } = await axios.post("/api/auth/login", body);
      router.push("/dashboard");

      setCookie("is_logged_in", true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  return (
    <div className="">
      <main className="bg-gradient-to-b from-blue-gray-50 to-white">
        <Navbar />

        <div className="mx-auto max-w-7xl w-full py-6  text-center lg:py-12  lg:text-left">
          <div className="px-4 w-full  flex flex-col justify-center items-center">
            <span className="px-3 py-1 text-blue-gray-50 text-sm font-semibold leading-4 uppercase tracking-wide bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full">
              Coming soon!
            </span>
            <h1 className=" text-4xl xl:inline text-blue-gray-900 tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              Applicant management
            </h1>
            <h1 className=" p-1 text-4xl xl:inline text-blue-gray-900 text-emerald tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-6xl xl:text-6xl text-center">
              at any scale
            </h1>
            <p className="mt-3 mx-auto text-xl text-center text-blue-gray-700 sm:text-2xl md:mt-5">
              Plutomi automates your entire application process with streamlined
              workflows
            </p>
          </div>
        </div>
        {/* // TODO - Hide this if user is already logged in via sessions */}

        {/* // TODO - Split this up into their own components */}

        <section className="flex justify-center  px-12" id="login">
          {cookies["is_logged_in"] ? (
            <>
              {" "}
              <Link href="/dashboard">
                <button
                  type="button"
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-gray-600 hover:bg-blue-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500"
                >
                  Click here to go to your dashboard
                  <ArrowRightIcon
                    className="ml-3 -mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </Link>
            </>
          ) : (
            <div className="mt-2 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              {/* <p className="text-base font-medium text-gray-900">
              Sign in to get started!
            </p> */}
              {formSubmitted ? (
                <form className="mt-3 sm:flex" onSubmit={(e) => login(e)}>
                  <label htmlFor="login_code" className="sr-only">
                    Login code
                  </label>
                  <input
                    type="text"
                    name="login_code"
                    id="login_code"
                    value={login_code}
                    onChange={(e) => setLoginCode(e.target.value)}
                    className="block w-full py-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 sm:flex-1 border-gray-300"
                    placeholder="Enter your login code"
                  />
                  <button
                    type="submit"
                    className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <form className="mt-3 sm:flex" onSubmit={(e) => sendCode(e)}>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={user_email}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="block w-full py-3 text-base rounded-md placeholder-gray-500 shadow-sm focus:ring-blue-gray-500 focus:border-blue-gray-500 sm:flex-1 border-gray-300"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="mt-3 w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-gray-500 sm:mt-0 sm:ml-3 sm:flex-shrink-0 sm:inline-flex sm:items-center sm:w-auto"
                  >
                    Sign In
                  </button>
                </form>
              )}

              <p className="mt-3 text-sm text-gray-500">
                {formSubmitted
                  ? `Your code expires shortly so please enter it soon.`
                  : `We’ll email you a magic code for a password-free sign in.`}
              </p>
            </div>
          )}
        </section>

        <section className="py-14">
          <FeatureBox />
        </section>
      </main>
      <section className="relative border-0 ">
        <div className="custom-shape-divider-top-1630498878">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      <section id="pricing">
        <NewPricing />
      </section>

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}
