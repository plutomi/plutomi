import useSelf from "../../SWR/useSelf";
import UpdateName from "./UpdateName";
import Loader from "../Loader";
import ClickToCopy from "../ClickToCopy";
import useOrgInfo from "../../SWR/useOrgInfo";
import { mutate } from "swr";
import { CreateOrg, DeleteOrg } from "../../adapters/Orgs";
import useStore from "../../utils/store";
import { OfficeBuildingIcon, PlusIcon } from "@heroicons/react/outline";
import CreateOrgModal from "../CreateOrgModal";
import { DEFAULTS, WEBSITE_URL } from "../../Config";
import { GetSelfInfoURL, UpdateUser } from "../../adapters/Users";
export default function DashboardContent() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = useOrgInfo(user?.orgId);
  const customApplyLink = `${WEBSITE_URL}/${org?.orgId}/apply`;

  const setCreateOrgModalOpen = useStore(
    (state) => state.setCreateOrgModalOpen
  );

  if (isUserLoading) {
    return <Loader text={"Loading user..."} />;
  }

  if (user.orgId !== DEFAULTS.NO_ORG && isOrgLoading) {
    return <Loader text={"Loading org info..."} />;
  }

  const createOrg = async ({ GSI1SK, orgId }) => {
    if (
      !confirm(
        `Your org id will be '${orgId.toLowerCase()}', this CANNOT be changed. Do you want to continue?`
      )
    ) {
      return;
    }

    try {
      const { message } = await CreateOrg(GSI1SK, orgId);
      alert(message);
      setCreateOrgModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(GetSelfInfoURL());
  };

  const updateName = async ({ firstName, lastName }) => {
    try {
      const { message } = await UpdateUser(user?.userId, {
        firstName: firstName,
        lastName: lastName,
        GSI1SK: `${firstName} ${lastName}`,
      });
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(GetSelfInfoURL());
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
      const { message } = await DeleteOrg();
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }
    mutate(GetSelfInfoURL()); // Refresh user state
  };

  return (
    <div>
      <CreateOrgModal createOrg={createOrg} />

      {user?.orgId === DEFAULTS.NO_ORG ? (
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
        <>
          <h1 className="text-2xl">
            You&apos;re in the <strong>{org?.displayName}</strong> org. Feel
            free to click around!
          </h1>
          <h1>
            There are <strong>{org?.totalUsers}</strong> users in this org.
          </h1>

          <h1>
            Also, there are <strong>{org?.totalApplicants}</strong> applicants
            across <strong>{org?.totalOpenings}</strong> openings.
          </h1>

          <div className="flex items-center mt-4 -ml-3 text-md">
            <ClickToCopy
              showText={"Copy Application Link"}
              copyText={customApplyLink}
            />
          </div>
          <div className="flex justify-center mx-auto">
            {(user?.firstName === DEFAULTS.FIRST_NAME ||
              user?.lastName === DEFAULTS.LAST_NAME) && (
              <UpdateName updateName={updateName} />
            )}
          </div>
          <div className="py-24">
            <button
              onClick={() => deleteOrg()}
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Org
            </button>
          </div>
        </>
      )}
    </div>
  );
}
