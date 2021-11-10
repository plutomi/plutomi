import useSelf from "../../SWR/useSelf";
import Loader from "../Loader";
import Invite from "./Invite";
import { mutate } from "swr";
import UsersService from "../../adapters/UsersService";
import { useRouter } from "next/router";
import InvitesService from "../../adapters/InvitesService";
import useOrgInvites from "../../SWR/useOrgInvites";
export default function InvitesContent() {
  const router = useRouter();
  const { user, isUserLoading, isUserError } = useSelf();
  // TODO we don't have to make this call ehre if a user doesn't have invites
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    user?.userId
  );

  const acceptInvite = async (invite) => {
    try {
      const { message } = await InvitesService.acceptInvite({
        invite_id: invite.invite_id,
      });
      alert(message);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    // Refresh the user's org_id
    mutate(UsersService.getSelfURL());

    // Refresh the user's invites
    mutate(InvitesService.getInvitesURL({ userId: user?.userId }));
  };

  const rejectInvite = async (invite) => {
    try {
      const { message } = await InvitesService.rejectInvite({
        invite_id: invite.invite_id,
      });

      alert(message);
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    mutate(InvitesService.getInvitesURL({ userId: user?.userId }));
  };

  if (isInvitesLoading) {
    return <Loader text="Loading invites..." />;
  }

  if (invites.length == 0) {
    return <h1>You don&apos;t have any invites :(</h1>;
  }
  return (
    <div className="">
      <ul
        role="list"
        className="divide-y divide-gray-200 mx-auto max-w-xl flex-col space-y-4 p-20  "
      >
        {invites.map((invite: DynamoOrgInvite) => (
          <Invite
            invite={invite}
            key={invite.invite_id}
            rejectInvite={rejectInvite}
            acceptInvite={acceptInvite}
          />
        ))}
      </ul>
    </div>
  );
}
