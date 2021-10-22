import { useSession } from "next-auth/client";
import Login from "../Login";
import useSelf from "../../SWR/useSelf";
import useOrgInvites from "../../SWR/useOrgInvites";
import { useSWRConfig } from "swr";
import SignedInNav from "../../components/Navbar/SignedInNav";
import { useRouter } from "next/router";
import Loader from "../Loader";
import InvitesContent from "../../components/Invites/InvitesContent";

export default function InvitesHeader() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [session, loading]: CustomSession = useSession();
  const { user, isUserLoading, isUserError } = useSelf();
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    session?.user_id
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
