import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen pt-16 pb-12 flex flex-col bg-white">
      <main className="flex-grow flex  pt-16 flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Page not found.
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-6">
            <Link href="/">
              <a className="flex-shrink-0 inline-block cursor-pointer items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white transition duration-300 ease-in-out  bg-emerald-500 hover:bg-emerald-600">
                Go back home
              </a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
