import { UseCaseExampleProps, UseCaseListItem } from '../UseCaseListItem';

const AllUseCases: UseCaseExampleProps[] = [
  {
    id: 1,
    name: 'Employee hiring',
    stages: [
      {
        id: '1',
        stageTitle: 'Resume Upload',
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
    name: 'Social services programs',
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
    name: 'Large scale contracting',
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
export const UseCaseList = () => (
  <div className=" ">
    <div className="max-w-7xl mx-auto py-8 space-y-24">
      {AllUseCases.map((example) => (
        <UseCaseListItem
          key={example.id}
          id={example.id}
          stages={example.stages}
          name={example.name}
        />
      ))}
    </div>
  </div>
);
