import axios from "axios";

export default function Main() {
  const t = axios.get("/"); // ! TODO: Remove

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Plutomi is currently undergoing maintenance :D
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            To enhance the long term stability of the project, I (Jose) am doing
            a major refactor. You can check the progress and all changes on
            GitHub or DM me on Twitter or by email if you have any questions :)
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            jose@plutomi.com
          </p>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            This site is current as of {today}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="https://github.com/plutomi/plutomi/pull/776"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm  hover:bg-gray-900 hover:text-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Plutomi on GitHub
            </a>
            <a
              href="https://twitter.com/notjoswayski"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-100 hover:text-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Jose on Twitter
            </a>
            {/* <a href="#" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </a> */}
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
