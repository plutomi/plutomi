import { PlusIcon } from "@heroicons/react/outline";

export default function Priing() {
  return (
    <div className="bg-white">
      <div className="py-12 sm:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-blue-gray-900 sm:text-3xl lg:text-3xl">
              No long term contracts or predatory sales calls
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              You only pay for what you use. <span>Recurring</span> charges are
              based on total applicants
            </p>
          </div>
          <div className="mt-8 flex border flex-wrap justify-center items-center rounded-md ">
            <div className="shadow-md   block md:flex w-auto rounded-md border border-blue-gray-900 align-centeritems-center flex-col bg-blue-gray-900">
              <div className="  py-4">
                <p className=" text-xl text-center font-bold text-white">
                  FLAT FEE
                </p>
              </div>
              <div className="bg-white p-8  text-center rounded-b-md">
                <h3 className=" text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  <div className=" space-x-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                    <span>$1</span>
                    <span className="ml-3 text-xl  font-normal text-gray-500">
                      / per applicant
                    </span>
                  </div>
                </h3>
              </div>
            </div>
            <div className="mx-4 flow-root">
              {" "}
              <PlusIcon className="h-8 w-8 " />
            </div>

            <div className="shadow-md rounded-md border border-blue-gray-900 align-centeritems-center  flex flex-col bg-blue-gray-900">
              <div className="  py-4">
                <p className=" text-xl text-center font-bold text-white">
                  RECURRING
                </p>
              </div>
              <div className="bg-white p-8  text-center rounded-b-md">
                <h3 className=" text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  <div className=" space-x-4 flex items-center justify-center text-5xl font-extrabold text-gray-900">
                    <span>$0.01</span>
                    <span className="ml-3 text-xl  font-normal text-gray-500">
                      / per applicant / per month
                    </span>
                  </div>
                </h3>
              </div>
            </div>
          </div>

          <p className="text-xs text-warm-gray-400 text-center mt-8">
            SMS, background checks, & ID verifications are billed per event
          </p>
        </div>
      </div>
    </div>
  );
}
