import PricingExample, { UseCaseExampleProps } from './UseCaseExample';

export default function UseCases() {
  const AllUseCases: UseCaseExampleProps[] = [
    {
      id: 1,
      stageTitle: 'Employee hiring',
      stages: [
        {
          id: '1',
          stagestageTitle: 'Resume Upload',
          totalApplicants: 2,
        },
        {
          id: '2',
          stageTitle: 'Resume Review',
          totalApplicants: 7,
        },
        {
          id: '3',
          stageTitle: 'Interviewing',
          totalApplicants: 5,
        },
        {
          id: 4,
          stageTitle: 'Hired',
          totalApplicants: 1,
        },
        {
          id: '5',
          stageTitle: 'Rejected',
          totalApplicants: 14,
        },
      ],
    },
    {
      id: '3',
      stageTitle: 'Social services programs',
      stages: [
        {
          id: '1',
          stageTitle: 'Registration',
          totalApplicants: 430,
        },
        {
          id: '2',
          stageTitle: 'ID Upload',
          totalApplicants: 31,
        },

        {
          id: '3',
          stageTitle: 'ID Verification',
          totalApplicants: 63,
        },
        {
          id: '4',
          stageTitle: 'Registered',
          totalApplicants: 258,
        },
        {
          id: '5',
          stageTitle: 'Did Not Qualify',
          totalApplicants: 216,
        },
      ],
    },
    {
      id: 4,
      stageTitle: 'Large scale contracting',
      stages: [
        {
          id: '1',
          stageTitle: 'Waiting List',
          totalApplicants: 89587,
        },
        {
          id: '2',
          stageTitle: 'Set Up Profile',
          totalApplicants: 12615,
        },

        {
          id: '3',
          stageTitle: 'Background Check',
          totalApplicants: 948,
        },
        {
          id: '4',
          stageTitle: 'Failed Check',
          totalApplicants: 27,
        },
        {
          id: '5',
          stageTitle: 'Ready to Drive',
          totalApplicants: 3926,
        },
      ],
    },
  ];

  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto py-8 space-y-24">
        {AllUseCases.map((example) => (
          <PricingExample key={example.id} stages={example.stages} name={example.name} />
        ))}
      </div>
    </div>
  );
}
