import Link from "next/dist/client/link";
import { ArrowLeftIcon } from "@heroicons/react/outline";

const products = [
  {
    id: 1,
    name: "awsbits.com",
    category: "Host: AWS (Route53)",
    href: "https://buy.stripe.com/6oE7ti9eG59mdHibIJ",
    price: "$39",
  },
  {
    id: 2,
    name: "creditcardhoroscope.com",
    category: "Host: AWS (Route53)",
    href: "https://buy.stripe.com/aEU7tiduW8lyeLm9AC",
    price: "$20",
  },
  {
    id: 3,
    name: "gelgy.com",
    category: "Host: AWS (Route53)",
    href: "https://buy.stripe.com/00g00QcqS59mgTu28b",
    price: "$49",
  },
  {
    id: 4,
    name: "kajua.com",
    category: "Host: AWS (Route53)",
    href: "https://buy.stripe.com/28o7ti76ydFSav66os",
    price: "$49",
  },
  {
    id: 5,
    name: "serverlessasaservice.com",
    category: "Host: Google Domains",
    href: "https://buy.stripe.com/7sI7ti8aC8lyeLm5kp",
    price: "$29",
  },
];

export default function Domains() {
  return (
    <div className="bg-white">
      <div className="max-w-2xl mx-auto px-4  sm:px-6 lg:max-w-7xl lg:px-8">
        <Link href="/">
          <button
            type="button"
            className="my-10 inline-flex items-center px-4 py-2  border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Go back home{" "}
          </button>
        </Link>
        <h2 className="text-lg font-medium text-gray-900 block">
          Domains for sale by Plutomi Inc.
        </h2>
        <p className="text-md font-normal text-gray-500">
          We will reach out immediately after purchase to confirm the details on
          where you'd like your domain to be transferred to. (Google Domains,
          GoDaddy, Route53, etc.)
        </p>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative group shadow-md p-4 rounded-md hover:shadow-xl transition ease-in-out duration-300"
            >
              <div className=" flex items-center justify-between text-base font-medium text-gray-900 space-x-8">
                <h3>
                  <a href={product.href} target="_blank" rel="noreferrer">
                    <span aria-hidden="true" className="absolute inset-0" />
                    {product.name}
                  </a>
                </h3>
                <p className="text-lg font-bold">{product.price}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500">{product.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
