import { mutate } from 'swr';
import { OfficeBuildingIcon, PlusIcon } from '@heroicons/react/outline';
import { useSelf } from '../../SWR/useSelf';
import { useOrgInfo } from '../../SWR/useOrgInfo';
import { DeleteOrg } from '../../adapters/Orgs';
import useStore from '../../utils/store';
import { DEFAULTS, WEBSITE_URL } from '../../Config';
import { GetSelfInfoURL } from '../../adapters/Users';
import { ClickToCopy } from '../ClickToCopy';
import { CreateOrgModal } from '../CreateOrgModal';
import { Loader } from '../Loader/Loader';
import { UpdateUserProfileModal } from '../UpdateUserInfoModal';
import { nameIsDefault } from '../../utils/compareStrings/nameIsDefault';

export const DashboardPageContent = () => {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = useOrgInfo({
    orgId: user?.orgId,
  });
  const customApplyLink = `${WEBSITE_URL}/${org?.orgId}/apply`;

  const openCreateOrgModal = useStore((state) => state.openCreateOrgModal);
  const openUserProfileModal = useStore((state) => state.openUserProfileModal);

  if (isUserError || isOrgError) return <h1>An error ocurred returning your info</h1>;

  if (isUserLoading) return <Loader text="Loading user..." />;

  if (user?.orgId !== DEFAULTS.NO_ORG && isOrgLoading) {
    return <Loader text="Loading org info..." />;
  }

  const deleteOrg = async () => {
    if (
      // eslint-disable-next-line no-restricted-globals
      !confirm(
        'Deleting an org is irreversible and will delete all openings, stages, applicants, questions, rules, etc. inside of it. Do you wish to continue?',
      )
    ) {
      return;
    }

    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure?')) {
      return;
    }

    try {
      const { data } = await DeleteOrg();
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(GetSelfInfoURL()); // Refresh user state
  };

  const UserNotInOrg = (
    <div className="text-center w-full h-full flex flex-col justify-center items-center">
      <OfficeBuildingIcon className="mx-auto h-12 w-12 text-light" />
      <h3 className="mt-2 text-lg font-medium text-dark">
        You don&apos;t belong to an organization.
      </h3>
      <p className="mt-1 text-lg text-normal">Get started by creating a new one!</p>
      <div className="mt-6">
        <button
          type="button"
          onClick={openCreateOrgModal}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Org
        </button>
      </div>
    </div>
  );

  const UserInOrg = (
    <>
      <h1 className="text-2xl">
        You&apos;re in the <strong>{org?.displayName}</strong> org. Feel free to click around!
      </h1>
      <h1>
        There are <strong>{org?.totalUsers}</strong> users in this org.
      </h1>

      <h1>
        Also, there are <strong>{org?.totalApplicants}</strong> applicants across{' '}
        <strong>{org?.totalOpenings}</strong> openings.
      </h1>

      <div className="flex items-center mt-4 -ml-3 text-md">
        <ClickToCopy showText="Copy Application Link" copyText={customApplyLink} />
      </div>
      <div className="flex justify-center mx-auto">
        <UpdateUserProfileModal user={user} />
        {nameIsDefault({
          firstName: user.firstName,
          lastName: user.lastName,
        }) && (
          <div>
            <h4>We don&apos;t seem to know your name!</h4>

            <button
              onClick={openUserProfileModal}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Click here to edit it!
            </button>
          </div>
        )}
      </div>
      <div className="py-24">
        <button
          onClick={deleteOrg}
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Org
        </button>
      </div>
    </>
  );

  return (
    <>
      <CreateOrgModal />
      {user?.orgId === DEFAULTS.NO_ORG ? UserNotInOrg : UserInOrg}
    </>
  );
};
