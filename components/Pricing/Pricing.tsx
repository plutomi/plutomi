import Calculator from "./Calculator";
import PricingCard from "./PricingCards";
const PricingCards = [
  {
    id: 2,
    applicant_type: "Idle",
    description: (
      <p className={`mt-6 text-xl text-left text-normal`}>
        Applicants are considered{" "}
        <span className=" font-bold text-idle-dark">idle</span> if they&apos;ve
        had updates <span className="italic">in the last 6 months</span>.
      </p>
    ),
  },
  {
    id: 1,
    applicant_type: "Active",
    description: (
      <p className={`mt-6 text-xl text-left text-normal`}>
        Applicants are considered{" "}
        <span className=" font-bold text-active-dark">active</span> if
        they&apos;ve had updates{" "}
        <span className="italic">in the last 30 days</span>.
      </p>
    ),
  },
];

export default function Pricing() {
  return (
    <div className="bg-blue-gray-900" id="pricing">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none lg:mt-16 mt-32">
            <p className="text-5xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Pricing that scales with you
            </p>
            <p className="text-xl text-blue-gray-300">
              No long term contracts or predatory sales calls. Only pay for what
              you use.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 pb-12 bg-white sm:mt-12 sm:pb-16 lg:mt-16 lg:pb-24">
        <div className="relative ">
          <div className="absolute inset-0 h-2/3 bg-blue-gray-900" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-md mx-auto space-y-4 lg:max-w-5xl lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 ">
              {PricingCards.map((card) => {
                return (
                  <PricingCard
                    key={card.id}
                    applicant_type={card.applicant_type}
                    description={card.description}
                  />
                );
              })}
            </div>
          </div>
          {/* <p className="text-sm my-4 text-blue-gray-400  mx-auto px-12 md:px-4 text-center">
            If you hav
          </p> */}
        </div>

        <Calculator />

        {/* <div className="mt-4 relative max-w-7xl mx-auto px-6 lg:mt-5">
          <div className="max-w-md mx-auto lg:max-w-5xl">
            <div className="rounded-lg bg-blue-gray-200 px-6 py-8 sm:p-10 lg:flex lg:items-center">
              <div className="flex-1">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white text-gray-800">
                    ENTERPRISE
                  </h3>
                </div>
                <div className="mt-4 text-lg text-blue-gray-600">
                  If you&apos;
                  <span className="font-semibold text-normal">$29</span>.
                </div>
              </div>
              <div className="mt-6 rounded-md shadow lg:mt-0 lg:ml-10 lg:flex-shrink-0">
                <a
                  href="#"
                  className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
