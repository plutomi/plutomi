import { PencilAltIcon } from '@heroicons/react/outline';
import { useSelf } from '../../SWR/useSelf';
import { DEFAULTS } from '../../Config';
import useStore from '../../utils/store';
import { Loader } from '../Loader';

export const UserProfilePageHeader = () => {
  const { user, isUserLoading, isUserError } = useSelf();

  const openUserProfileModal = useStore((state) => state.openUserProfileModal);

  if (isUserLoading) {
    <Loader text="Loading profile..." />;
  }
  const greeting = (
    <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
      Welcome to your profile
      {user?.firstName === DEFAULTS.FIRST_NAME ? '!' : `, ${user?.firstName}!`}
    </h2>
  );
  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">{greeting}</div>

      <div className="mt-4 flex md:mt-0 md:ml-4 ">
        <button
          onClick={openUserProfileModal}
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilAltIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Edit Profile
        </button>
      </div>
    </div>
  );
};
