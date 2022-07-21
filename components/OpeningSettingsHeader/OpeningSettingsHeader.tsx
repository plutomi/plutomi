import { PencilAltIcon, TrashIcon } from '@heroicons/react/outline';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import useStore from '../../utils/store';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { DeleteOpening, GetOpeningsInOrgURL } from '../../adapters/Openings';
import * as Time from '../../utils/time';
import { CustomQuery } from '../../types/main';
import { OpeningState, WEBSITE_URL } from '../../Config';
import { Loader } from '../Loader';
import { OpeningSettingsBreadcrumbs } from '../OpeningSettingsBreadcrumbs';
import { CrumbProps } from '../types';

export const OpeningSettingsHeader = () => {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;
  const openUpdateOpeningModal = useStore((state) => state.openUpdateOpeningModal);

  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });

  if (isOpeningError) return <h1>An error ocurred retrieving info for this opening</h1>;

  if (isOpeningLoading) return <Loader text="Loading opening..." />;

  const crumbs: CrumbProps[] = [
    {
      name: 'Opening Settings',
      href: `/openings/${openingId}/settings`,
      current: true,
    },
  ];

  // Hide applicant crumb if opening has no stages
  if (opening?.totalStages > 0) {
    crumbs.unshift({
      name: 'Applicants',
      href: `/openings/${openingId}/stages/${opening?.stageOrder[0]}/applicants`, // TODO should this end with /applicants?
      current: false,
    });
  }

  const deleteOpening = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this opening? All stages inside of it will also be deleted. This action cannot be reversed!',
      )
    ) {
      return;
    }

    if (!confirm('Are you sure?')) {
      return;
    }

    try {
      await DeleteOpening(openingId);
      router.push(`${WEBSITE_URL}/openings`);
    } catch (error) {
      alert(error.response.data.message);
    }

    // Refresh openings
    mutate(GetOpeningsInOrgURL());
  };

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 flex flex-col items-start ">
        <OpeningSettingsBreadcrumbs crumbs={crumbs} />
      </div>

      <div className="flex justify-center space-x-4 py-2 items-center">
        <span
          className={` inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
            opening?.GSI1SK === OpeningState.PUBLIC ? 'bg-green-100' : 'bg-blue-gray-100'
          }`}
        >
          <svg
            className={`-ml-0.5 mr-1.5 h-2 w-2 ${
              opening?.GSI1SK === OpeningState.PUBLIC ? 'text-green-800' : 'text-blue-gray-800'
            }`}
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx={4} cy={4} r={3} />
          </svg>
          {opening?.GSI1SK === OpeningState.PUBLIC ? 'Public' : 'Private'}
        </span>
        <p className="text-md text-light text-center">
          Created {Time.relative(opening?.createdAt)}
        </p>
      </div>
      <div className="space-x-4 flex items-center">
        <button
          type="button"
          onClick={openUpdateOpeningModal}
          className="inline-flex items-center px-4 py-2 border  shadow-sm text-base font-medium rounded-md border-blue-500 text-blue-500 bg-white hover:bg-blue-500 hover:text-white  transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilAltIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Edit Opening
        </button>
        <button
          type="button"
          onClick={deleteOpening}
          className="rounded-full hover:bg-red-500 hover:text-white border border-red-500 text-red-500 transition ease-in-out duration-200 px-2 py-2 text-md"
        >
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
