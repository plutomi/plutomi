<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
<<<<<<< HEAD
import SignIn from "../../components/SignIn";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
import Login from "../Login";
>>>>>>> d64c806 (Got rid of callback url on login component)
import useSelf from "../../SWR/useSelf";
import useOrgInvites from "../../SWR/useOrgInvites";
import { useSWRConfig } from "swr";
import { useRouter } from "next/router";

export default function InvitesHeader() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
<<<<<<< HEAD
=======
  const [session, loading]: CustomSession = useSession();
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  const { user, isUserLoading, isUserError } = useSelf();
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    user?.user_id
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
