import PricingCard from "./PricingCards";

const PricingCards = [
  {
    id: 1,
    stage_type: "Idle",
    fee_type: `/ per applicant / per month`,
    description: (
      <p className="mt-6 text-lg text-blue-gray-600 text-left">
        Applicants in <span className="text-blue-gray-600 font-bold">idle</span>{" "}
        stages are <i>waiting for a future event</i> like a manual review to be
        completed or a waitlist to open.
      </p>
    ),
  },

  {
    id: 2,
    stage_type: "Active",
    fee_type: `/ per applicant / per month`,
    description: (
      <p className="mt-6 text-lg text-blue-gray-600 text-left">
        Applicants in <span className="text-orange-600 font-bold">active</span>{" "}
        stages are completing tasks such as answering questions or uploading
        files.
      </p>
    ),
  },

  {
    id: 3,
    stage_type: "Deletion",
    fee_type: `/ per applicant`,
    description: (
      <p className="mt-6 text-lg text-blue-gray-600 text-left">
        Applicants in this stage will be{" "}
        <span className="text-rose-600 font-bold">deleted</span> within 48
        hours. This stage is best suited for rejected applicants.
      </p>
    ),
  },
  {
    id: 4,
    stage_type: "Frozen",
    fee_type: `/ per applicant `,
    description: (
      <p className="mt-6 text-lg text-blue-gray-600 text-left">
        Applicants in <span className="text-cyan-600 font-bold">frozen</span>{" "}
        stages are not completing tasks. This stage is best suited as your final
        stage for record keeping.
      </p>
    ),
  },
];

const PricingExamples = [
  {
    id: 1,
    name: "Employee hiring",
    stages: [
      {
        id: 1,
        name: "Resume Upload",
        applicants: 2,
        type: "active",
      },
      {
        id: 2,
        name: "Resume Review",
        applicants: 2,
        type: "idle",
      },
      {
        id: 3,
        name: "Interviewing",
        applicants: 5,
        type: "idle",
      },
      {
        id: 4,
        name: "Hired",
        applicants: 1,
        type: "frozen",
      },
      {
        id: 5,
        name: "Rejected",
        applicants: 14,
        type: "deletion",
      },
    ],
  },

  {
    id: 2,
    name: "Summer camp / after-school program",
    stages: [
      {
        id: 1,
        name: "Child Info",
        applicants: 43,
        type: "active",
      },
      {
        id: 2,
        name: "Age Filter",
        applicants: 21,
        type: "deletion",
      },
      {
        id: 3,
        name: "Liability Waiver",
        applicants: 8,
        type: "active",
      },
      {
        id: 4,
        name: "Under Review",
        applicants: 29,
        type: "idle",
      },
      {
        id: 5,
        name: "Admitted",
        applicants: 57,
        type: "frozen",
      },
    ],
  },
  {
    id: 3,
    name: "Non-profit assitance program",
    stages: [
      {
        id: 1,
        name: "Registration",
        applicants: 430,
        type: "active",
      },
      {
        id: 2,
        name: "ID Upload",
        applicants: 31,
        type: "active",
      },

      {
        id: 3,
        name: "ID Verification",
        applicants: 63,
        type: "idle",
      },
      {
        id: 4,
        name: "Registered",
        applicants: 258,
        type: "frozen",
      },
      {
        id: 5,
        name: "Did Not Qualify",
        applicants: 216,
        type: "deletion",
      },
    ],
  },
  {
    id: 4,
    name: "Gig-economy contracting",
    stages: [
      {
        id: 1,
        name: "Waiting List",
        applicants: 89587,
        type: "idle",
      },
      {
        id: 2,
        name: "Set Up Profile",
        applicants: 12615,
        type: "active",
      },

      {
        id: 3,
        name: "Background Check",
        applicants: 948,
        type: "idle",
      },
      {
        id: 4,
        name: "Failed Check",
        applicants: 27,
        type: "deletion",
      },
      {
        id: 5,
        name: "Contracted",
        applicants: 3926,
        type: "frozen",
      },
    ],
  },
];

import PricingExample from "./PricingExample";
export default function Pricing() {
  return (
    <div className="bg-blue-gray-900" id="pricing">
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
            <div className="max-w-md mx-auto space-y-4 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0 ">
              {PricingCards.map((card) => {
                return (
                  <PricingCard
                    key={card.id}
                    description={card.description}
                    fee_type={card.fee_type}
                    stage_type={card.stage_type}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-sm my-4 text-blue-gray-400  mx-auto px-12 md:px-4 text-center">
            Background checks, ID verifications, and e-signatures are charged
            per event
          </p>
        </div>

        <section className="space-y-10 md:space-y-14  mt-4 p-4  max-w-lg lg:max-w-7xl mx-auto px-12 sm:px-6 ">
          <h4 className="mt-6 text-xl text-blue-gray-600 text-left max-w-full">
            Below are a few pricing examples of common use cases. Keep in mind
            that applicants in{" "}
            <span className="text-rose-600 font-bold">deletion</span> and{" "}
            <span className="text-cyan-600 font-bold">frozen</span> stages are
            billed each time an applicant lands on them and{" "}
            <span className="font-bold">do not</span> have recurring monthly
            charges.
          </h4>

          {PricingExamples.map((example) => (
            <PricingExample
              key={example.id}
              id={example.id}
              stages={example.stages}
              name={example.name}
            />
          ))}
        </section>

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
