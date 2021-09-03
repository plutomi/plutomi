import PricingExample1 from "./PricingExamples/PricingExample1";
import PricingExample2 from "./PricingExamples/PricingExample2";
import PricingExample3 from "./PricingExamples/PricingExample3";
import CustomLink from "./CustomLink";
export default function Example() {
  return (
    <div className="bg-blue-gray-900">
      <div className="pt-12 sm:pt-16 lg:pt-24">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-2 lg:max-w-none lg:mt-16 mt-32">
            <p className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
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
              {/* test  */}
              <div className="shadow-md block md:flex w-auto rounded-md  flex-col">
                <div className={`py-4 bg-orange-100 rounded-t-md`}>
                  <p
                    className={`text-xl text-center font-bold text-orange-600`}
                  >
                    Active Stages
                  </p>
                </div>
                <div className="bg-white p-8  text-center rounded-b-md ">
                  <h3 className=" text-2xl font-extrabold text-blue-gray-900 sm:text-3xl">
                    <div className=" space-x-4 flex flex-wrap items-center justify-center text-3xl lg:text-5xl font-extrabold text-blue-gray-900">
                      <span className="w-full">$0.25</span>
                      <span className="text-base md:text-lg  mt-2 font-normal text-blue-gray-500">
                        / per applicant / per month
                      </span>
                    </div>
                  </h3>
                  <p className="mt-6 text-lg text-blue-gray-600 text-left">
                    Applicants in{" "}
                    <span className="text-orange-600 font-bold">active</span>{" "}
                    stages are completing tasks such as answering questions,
                    signing documents, or uploading files
                  </p>
                </div>
              </div>
              {/* test  */}
              <div className="shadow-md  block md:flex w-auto rounded-md  flex-col">
                <div className={`py-4 bg-blue-gray-100 rounded-t-md`}>
                  <p
                    className={`text-xl text-center font-bold text-blue-gray-600`}
                  >
                    Idle Stages
                  </p>
                </div>
                <div className="bg-white p-8  text-center rounded-b-md ">
                  <h3 className=" text-2xl font-extrabold text-blue-gray-900 sm:text-3xl">
                    <div className=" space-x-4 flex flex-wrap items-center justify-center text-3xl lg:text-5xl font-extrabold text-blue-gray-900">
                      <span className="w-full">$0.05</span>
                      <span className="text-base md:text-lg  mt-2 font-normal text-blue-gray-500">
                        / per applicant / per month
                      </span>
                    </div>
                  </h3>
                  <p className="mt-6 text-lg text-blue-gray-600 text-left">
                    Applicants in{" "}
                    <span className="text-blue-gray-600 font-bold">idle</span>{" "}
                    stages are <i>waiting for a future event</i> like a
                    background check to finish, a manual review to be completed,
                    or a waitlist to open
                  </p>
                </div>
              </div>

              {/* test  */}
              <div className="shadow-md  block md:flex w-auto rounded-md  flex-col col-span-2">
                <div className={`py-4 bg-cyan-100 rounded-t-md`}>
                  <p className={`text-xl text-center font-bold text-cyan-600`}>
                    Frozen Stages
                  </p>
                </div>
                <div className="bg-white p-8  text-center rounded-b-md ">
                  <h3 className=" text-2xl font-extrabold text-blue-gray-900 sm:text-3xl">
                    <div className=" space-x-4 flex flex-wrap items-center justify-center text-3xl lg:text-5xl font-extrabold text-blue-gray-900">
                      <span className="w-full">$1</span>
                      <span className="text-base md:text-lg  mt-2 font-normal text-blue-gray-500">
                        / per applicant
                      </span>
                    </div>
                  </h3>
                  <p className="mt-6 text-lg text-blue-gray-600 text-left">
                    Similar to{" "}
                    <span className="text-blue-gray-600 font-bold">idle</span>{" "}
                    stages, applicants in this stage are not completing tasks.
                    Applicants in{" "}
                    <span className="text-cyan-600 font-bold">frozen</span>{" "}
                    stages are billed at a flat rate each time an applicant
                    lands on them. It is recommended to have your final stage be
                    of this type.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm my-4 text-blue-gray-400  mx-auto px-12 md:px-4 text-center">
            Background checks, ID verifications, and e-signatures are charged
            per event
          </p>
        </div>

        <section className="space-y-10 md:space-y-14  mt-16 p-4  max-w-lg lg:max-w-6xl mx-auto px-12 sm:px-6 lg:px-8">
          <h4 className="mt-6 text-lg text-blue-gray-600 text-left max-w-full">
            At the end of the month, your bill will be determined by what stages
            your applicants are in. Below are a few examples of common use
            cases. If you would like to design a custom plan for your
            organization, please{" "}
            <CustomLink
              url="mailto:contact@plutomi.com?subject=Custom%20Pricing"
              text="contact us"
            />
            !
          </h4>
          <PricingExample1 />
          <PricingExample2 />
          <PricingExample3 />
        </section>

        {/* <div className="mt-4 relative max-w-7xl mx-auto px-6 lg:mt-5">
          <div className="max-w-md mx-auto lg:max-w-5xl">
            <div className="rounded-lg bg-blue-gray-100 px-6 py-8 sm:p-10 lg:flex lg:items-center">
              <div className="flex-1">
                <div>
                  <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-white text-gray-800">
                    ENTERPRISE
                  </h3>
                </div>
                <div className="mt-4 text-lg text-blue-gray-600">
                  If you&apos;
                  <span className="font-semibold text-blue-gray-900">$29</span>.
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
