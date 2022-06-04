import { UserGroupIcon } from '@heroicons/react/outline';
import NumberFormat from 'react-number-format';

export interface UseCaseExampleStageCardProps {
  id: string | number;
  stageTitle: string;
  totalApplicants: number;
  className?: string;
}

export const USeCaseExampleStageCard = ({
  id,
  stageTitle,
  totalApplicants,
  className,
}: UseCaseExampleStageCardProps) => (
  <div className={className}>
    <div className="relative text-center bg-white  py-5   sm:py-6 sm:px-3 shadow-md rounded-xl overflow-hidden">
      <dt>
        <p className=" text-lg font-medium text-dark">{stageTitle}</p>
      </dt>
      <dd className="flex items-center  justify-center">
        <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
          <UserGroupIcon className="w-5 h-5 0" />
          <p className="text-xl font-semibold ">
            <NumberFormat value={totalApplicants} thousandSeparator displayType="text" />
          </p>
        </div>
      </dd>
    </div>
  </div>
);
