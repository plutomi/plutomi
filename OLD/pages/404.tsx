import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/outline';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen pt-16 pb-12 flex flex-col bg-white">
      <main className="flex-grow flex  pt-16 flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-dark tracking-tight sm:text-5xl">
            Page not found.
          </h1>
          <p className="mt-2 text-base text-normal">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-6">
            <button
              onClick={router.back}
              type="button"
              className="px-4 inline-flex items-center py-3  transition duration-300 ease-in-out font-medium  bg-emerald-500 hover:bg-emerald-800 rounded-md text-white"
            >
              <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
