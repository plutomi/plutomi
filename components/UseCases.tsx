import PricingExample from "./UseCaseExample";

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
        },
        {
          id: 2,
          name: "Resume Review",
          applicants: 7,
        },
        {
          id: 3,
          name: "Interviewing",
          applicants: 5,
        },
        {
          id: 4,
          name: "Hired",
          applicants: 1,
        },
        {
          id: 5,
          name: "Rejected",
          applicants: 14,
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
        },
        {
          id: 2,
          name: "ID Upload",
          applicants: 31,
        },

        {
          id: 3,
          name: "ID Verification",
          applicants: 63,
        },
        {
          id: 4,
          name: "Registered",
          applicants: 258,
        },
        {
          id: 5,
          name: "Did Not Qualify",
          applicants: 216,
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
        },
        {
          id: 2,
          name: "Set Up Profile",
          applicants: 12615,
        },

        {
          id: 3,
          name: "Background Check",
          applicants: 948,
        },
        {
          id: 4,
          name: "Failed Check",
          applicants: 27,
        },
        {
          id: 5,
          name: "Ready to Drive",
          applicants: 3926,
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
