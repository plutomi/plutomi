<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../SWR/useSelf";
import { PencilAltIcon, PlusIcon } from "@heroicons/react/outline";
import Loader from "../Loader";
import useStore from "../../utils/store";
export default function UserProfileHeader() {
  const { user, isUserLoading, isUserError } = useSelf();
  const setUserProfileModal = useStore(
    (state: PlutomiState) => state.setUserProfileModal
  );
  if (isUserLoading) {
    return <Loader text="Loading profile..." />;
  }
  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Welcome to your profile, {user?.first_name}!
        </h2>
      </div>

      <div className="mt-4 flex md:mt-0 md:ml-4 ">
        <button
          onClick={() =>
            setUserProfileModal({
              is_modal_open: true,
              modal_mode: "EDIT",
              first_name: user?.first_name,
              last_name: user?.last_name,
            })
          }
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PencilAltIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
