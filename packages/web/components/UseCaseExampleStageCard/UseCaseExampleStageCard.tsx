import { UserGroupIcon } from "@heroicons/react/24/outline";

export type UseCaseExampleStageCardProps = {
  id: string | number;
  stageTitle: string;
  totalApplicants: number;
};

export const USeCaseExampleStageCard = ({
  stageTitle,
  totalApplicants
}: UseCaseExampleStageCardProps) => (
  <div className="rounded-md animate-background inline-block bg-white from-indigo-300 via-pink-200 to-indigo-300 bg-[length:400%_400%] p-0.5 [animation-duration:_1s] bg-gradient-to-r ">
    <div className=" rounded-md block px-5 py-3  bg-white text-gray-900">
      <dt>
        <p className=" text-lg font-medium text-dark">{stageTitle}</p>
      </dt>
      <dd className="flex items-center  justify-center text-gray-700">
        <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
          <UserGroupIcon className="w-5 h-5 0" />
          <p className="text-xl font-semibold ">
            {totalApplicants.toLocaleString()}
          </p>
        </div>
      </dd>
    </div>
  </div>
);
