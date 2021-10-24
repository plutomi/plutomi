import Loader from "../components/Loader";
import useSelf from "../SWR/useSelf";
import { mutate } from "swr";
import OrgsService from "../adapters/OrgsService";
import useStore from "../utils/store";
import { OfficeBuildingIcon } from "@heroicons/react/outline";
import UsersService from "../adapters/UsersService";
import usePrivateOrgById from "../SWR/usePrivateOrgById";
import ClickToCopy from "./ClickToCopy";
import UpdateName from "./Dashboard/UpdateName";
import { PlusIcon } from "@heroicons/react/outline";

export default function Dashboard() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  const custom_apply_link = `${process.env.PLUTOMI_URL}/${org?.org_id}/apply`;

  const setCreateOrgModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOrgModalOpen
  );

  const createOrg = async ({ GSI1SK, org_id }) => {
    if (
      !confirm(
        // TODO add clean org name here
        `Your org id will be '${org_id.toLowerCase()}', this CANNOT be changed. Do you want to continue?`
      )
    ) {
      return;
    }

    try {
      const { message } = await OrgsService.createOrg({
        GSI1SK: GSI1SK,
        org_id: org_id,
      });
      alert(message);
      setCreateOrgModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getSelfURL());
  };

  if (isUserLoading || isOrgLoading) {
    return <Loader text={"Loading..."} />;
  }

  const updateName = async ({ first_name, last_name }) => {
    try {
      const { message } = await UsersService.updateUser({
        user_id: user?.user_id,
        new_user_values: {
          first_name: first_name,
          last_name: last_name,
          GSI1SK: `${first_name} ${last_name}`,
        },
      });
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getSelfURL());
  };

  const deleteOrg = async () => {
    if (
      !confirm(
        "Deleting an org is irreversible and will delete all openings, stages, applicants, questions, rules, etc. inside of it. Do you wish to continue?"
      )
    ) {
      return;
    }

    if (!confirm("Are you sure?")) {
      return;
    }

    try {
      const { message } = await OrgsService.deleteOrg({ org_id: user?.org_id });
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getSelfURL());
  };
  return (
    <>
      {user?.org_id === "NO_ORG_ASSIGNED" ? (
        <div className="text-center w-full h-full flex flex-col justify-center items-center">
          <OfficeBuildingIcon className="mx-auto h-12 w-12 text-light" />
          <h3 className="mt-2 text-lg font-medium text-dark">
            You don&apos;t belong to an organization.
          </h3>
          <p className="mt-1 text-lg text-normal">
            Get started by creating a new one!
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setCreateOrgModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Org
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl">
            You&apos;re in the <strong>{org?.GSI1SK}</strong> org. Feel free to
            click around!
          </h1>
          <div className="flex items-center mt-4 -ml-3 text-md">
            <ClickToCopy
              showText={"Copy Application Link"}
              copyText={custom_apply_link}
            />
          </div>
          <div className="flex justify-center mx-auto">
            {user?.first_name === "NO_FIRST_NAME" ||
            user?.first_name === "NO_FIRST_NAME" ? (
              <UpdateName updateName={updateName} />
            ) : null}
          </div>
          <div className="py-48">
            <button
              onClick={() => deleteOrg()}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Org
            </button>
          </div>
        </div>
      )}
    </>
  );
}
