import { BellIcon } from '@heroicons/react/outline';
import Link from 'next/dist/client/link';

interface BannerProps {
  msgSmall: string;
  msgLarge: string;
  btnText: string;
  href: string;
}

export const Banner = ({ msgSmall, msgLarge, btnText, href }: BannerProps) => (
  <div className="bg-blue-600">
    <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between flex-wrap">
        <div className="w-0 flex-1 flex items-center">
          <span className="flex p-2 rounded-lg bg-blue-800">
            <BellIcon className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <p className="ml-3 font-medium text-white truncate">
            <span className="md:hidden">{msgSmall}</span>
            <span className="hidden md:inline">{msgLarge}</span>
          </p>
        </div>
        <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
          <Link href={href} passHref>
            {/*  eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50">
              {btnText}
            </a>
          </Link>
        </div>
        {/* <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className="-mr-1 flex p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div> */}
      </div>
    </div>
  </div>
);
