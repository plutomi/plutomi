import React from 'react';
import Link from 'next/dist/client/link';
import { UserGroupIcon } from '@heroicons/react/outline';
import NumberFormat from 'react-number-format';
import router from 'next/router';
import { CustomQuery } from '../../types/main';

interface StageCardProps {
  name: string;
  stageId: string;
  totalApplicants: number;
  linkHref: string;
  draggable: boolean;
}

export const StageCard = ({
  name,
  stageId,
  totalApplicants,
  linkHref,
  draggable,
}: StageCardProps) => {
  const urlParams = router.query as Pick<CustomQuery, 'stageId'>;

  const content = (
    <div
      className={`border my-4 shadow-xs py-4 text-center hover:border-blue-500  transition ease-in-out duration-300 rounded-xl overflow-hidden ${
        stageId === urlParams.stageId
          ? ' bg-sky-50  border border-t-4 border-t-blue-500'
          : ' bg-white'
      } ${draggable ? ' shadow-md hover:shadow-lg transition ease-in-out duration-300' : ''}`}
    >
      <h5 className=" px-2 text-md font-medium text-dark truncate">{name}</h5>

      <dd className="flex items-center  justify-center">
        <div className="space-x-2 flex  mt-1 items-center text-blue-gray-500">
          <UserGroupIcon className="w-5 h-5 0" />
          <p className="text-md font-semibold ">
            <NumberFormat value={totalApplicants} thousandSeparator displayType="text" />
          </p>
        </div>
      </dd>
    </div>
  );

  return (
    <Link href={linkHref}>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>{content}</a>
    </Link>
  );
};
