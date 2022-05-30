import DisplayStageCard, { UseCaseExampleStageCardProps } from './DisplayStageCard';

export interface UseCaseExampleProps {
  name: string;
  stages: UseCaseExampleStageCardProps[];
}

export default function Example({ stages, name }: UseCaseExampleProps) {
  return (
    <div className="relative my-8 mx-auto text-center lg:max-w-full max-w-sm ">
      <h3 className="text-2xl leading-6 font-medium text-blue-gray-900">{name}</h3>

      <div className="my-4 grid grid-cols-1 gap-4 lg:grid-cols-5 mx-12 lg:mx-auto">
        {stages?.map((stage) => (
          <DisplayStageCard
            className={null}
            key={stage.id}
            id={stage.id}
            stageTitle={stage.stageTitle}
            totalApplicants={stage.totalApplicants}
          />
        ))}
      </div>
    </div>
  );
}
