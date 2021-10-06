import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import UpdateName from "./UpdateName";
import Loader from "../Loader";
import ClickToCopy from "../ClickToCopy";
import usePrivateOrgById from "../../SWR/usePrivateOrgById";
import axios from "axios";
import { mutate } from "swr";
export default function DashboardContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  const custom_apply_link = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${org?.org_id}/apply`;

  if (isUserLoading || isOrgLoading) {
    return <Loader text={"Loading..."} />;
  }

  // TODO fix types
  const updateName = async ({ first_name, last_name }) => {
    try {
      const body = {
        updated_user: {
          ...user,
          first_name: first_name,
          last_name: last_name,
          GSI1SK: `${first_name} ${last_name}`,
        },
      };
      const { data } = await axios.put(`/api/users/${user?.user_id}`, body);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(`/api/users/${user?.user_id}`);
  };

  const deleteOrg = async () => {
    if (
      !confirm(
        "Deleting an org is irreversible and will delete all openings, stages, questions, rules, etc. inside of it. Do you wish to continue?"
      )
    ) {
      return;
    }

    if (!confirm("Are you sure?")) {
      return;
    }

    try {
      const { data } = await axios.delete(`/api/orgs/${user?.org_id}`);

      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
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
