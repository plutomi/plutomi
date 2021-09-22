import PricingExample from "./Pricing/PricingExample";

export default function UseCases() {
  const AllUseCases = [
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
          applicants: 7,
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
      id: 3,
      name: "Social services programs",
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
      name: "Large scale contracting",
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
          name: "Ready to Drive",
          applicants: 3926,
          type: "frozen",
        },
      ],
    },
  ];

  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto py-8 space-y-24">
        {AllUseCases.map((example) => (
          <PricingExample
            key={example.id}
            stages={example.stages}
            name={example.name}
          />
        ))}
      </div>
    </div>
  );
}
