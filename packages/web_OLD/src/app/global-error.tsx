// import Link from "next/link";
"use client"; // TODO: sighhghodahjfoihadopfhaposhdfo
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="grid min-h-full place-items-center  px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <p className="text-base font-semibold text-red-600">500</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Something broke :(
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-700">
              We&apos;re looking into it!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {/* <Link
                href="/"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Go back home
              </Link> */}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
