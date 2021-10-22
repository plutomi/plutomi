<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../SWR/useSelf";
import UpdateName from "./UpdateName";
import Loader from "../Loader";
import ClickToCopy from "../ClickToCopy";
import usePrivateOrgById from "../../SWR/usePrivateOrgById";
import { mutate } from "swr";
import UsersService from "../../adapters/UsersService";
import OrgsService from "../../adapters/OrgsService";
export default function DashboardContent() {
  const { user, isUserLoading, isUserError } = useSelf();
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  const custom_apply_link = `${process.env.PLUTOMI_URL}/${org?.org_id}/apply`;

  if (isUserLoading || isOrgLoading) {
    return <Loader text={"Loading..."} />;
  }

  // TODO fix types
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
  );
}
