import useSelf from "../../SWR/useSelf";
import useOrgInvites from "../../SWR/useOrgInvites";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";

export default function InvitesHeader() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { user, isUserLoading, isUserError } = useSelf();
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    user?.userId
  );

  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Invites
        </h2>
      </div>
    </div>
  );
}
