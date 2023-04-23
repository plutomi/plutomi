import axios from "axios";
import { useState } from "react";

export const Notified = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post("/api/subscribe", {
        email
      });
    } catch (error) {
      setLoading(false);

      return;
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="mx-auto  max-w-7xl sm:mt-8 sm:px-6 lg:px-8">
      <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-8 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-14">
        {submitted ? (
          <p className="mx-auto mt-2 max-w-md text-center text-xl leading-8 text-gray-300">
            Thanks for your interest! Make sure to check out{" "}
            <a
              href="https://github.com/plutomi/plutomi"
              target="_blank"
              rel="noreferrer"
              className="underline  font-semibold text-blue-400 shadow-sm  hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {" "}
              Plutomi on GitHub!{" "}
            </a>
          </p>
        ) : (
          <>
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get notified when we’re launching.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
              Plutomi is currently in development but we can send you an email
              once things are up and running!
            </p>

            <p className="mx-auto mt-2  text-center text-lg leading-8 text-gray-300">
              We promise not to spam you -{" "}
              <a
                href="https://github.com/plutomi/plutomi"
                target="_blank"
                rel="noreferrer"
                className="underline  font-semibold text-blue-400 shadow-sm  hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {" "}
                we don&apos;t even have the ability to do that :&apos;){" "}
              </a>
            </p>

            <form className="mx-auto mt-10 flex max-w-md gap-x-4">
              {/* ts-expect-error */}
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                autoComplete="email"
                required
                className="min-w-0 flex-auto rounded-md border border-blue-600  bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-white sm:text-sm sm:leading-6"
                placeholder="Enter your email"
              />

              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  void handleSubmit();
                }}
                disabled={loading}
                className={`flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  loading ? "opacity-50" : ""
                }`}
              >
                {loading ? (
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="inline mr-3 w-4 h-4 text-red animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
                {loading ? "Submitting" : "Notify me"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
