import { CogIcon } from '@heroicons/react/outline';
import Link from 'next/dist/client/link';
import { useRouter } from 'next/router';
import { useSelf } from '../../SWR/useSelf';
import { useOpeningInfo } from '../../SWR/useOpeningInfo';
import { useOpeningsInOrg } from '../../SWR/useOpeningsInOrg';
import { CustomQuery, IndexedEntities } from '../../types/main';
import { OpeningState, WEBSITE_URL } from '../../Config';
import { OpeningsDropdown } from '../OpeningsDropdown';
import { ClickToCopy } from '../ClickToCopy';
import { Loader } from '../Loader';
import { findInTargetArray } from '../../utils/findInTargetArray';

export const ApplicantsPageHeader = () => {
  const router = useRouter();
  const { openingId } = router.query as Pick<CustomQuery, 'openingId'>;

  const { user, isUserLoading, isUserError } = useSelf();
  const { opening, isOpeningLoading, isOpeningError } = useOpeningInfo({ openingId });
  const { openingsInOrg, isOpeningsInOrgLoading, isOpeningsInOrgError } = useOpeningsInOrg();

  if (isOpeningsInOrgError) return <h1>An error ocurred loading openings in this org</h1>;
  if (isOpeningError) return <h1>An error ocurred retrieving info for this opening</h1>;
  if (isOpeningLoading || isOpeningsInOrgLoading)
    return <Loader text="Loading opening(s) info..."></Loader>;

  const orgId = findInTargetArray({ entity: IndexedEntities.Org, targetArray: opening.target });
  const openingState = findInTargetArray({
    entity: IndexedEntities.OpeningState,
    targetArray: opening.target,
  });

  return (
    <div className="md:flex md:items-center md:justify-between  ">
      <div className=" min-w-0 w-2/3 inline-flex justify-between items-center ">
        <OpeningsDropdown
          openings={openingsInOrg}
          index={openingsInOrg?.indexOf(openingsInOrg?.find((opening) => opening.id === openingId))}
        />
      </div>

      {openingState === OpeningState.PUBLIC && (
        <p className="mt-2 text-md text-normal sm:mt-0 ">
          <ClickToCopy
            showText="Application Link"
            copyText={`${WEBSITE_URL}/${orgId}/${opening?.id}/apply`}
          />
        </p>
      )}

      <div className=" flex justify-center">
        <Link href={`/openings/${openingId}/settings`}>
          <CogIcon className="w-10 h-10  hover:text-dark text-light cursor-pointer transition duration-300 ease-in-out" />
        </Link>
      </div>
    </div>
  );
};
