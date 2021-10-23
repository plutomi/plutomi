<<<<<<< HEAD
<<<<<<< HEAD
import Login from "../components/Login";
import useSelf from "../SWR/useSelf";
=======
import { useSession } from "next-auth/client";
import Login from "../components/Login";
import useSelf from "../SWR/useSelf";
import useOrgInvites from "../SWR/useOrgInvites";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
import Login from "../components/Login";
import useSelf from "../SWR/useSelf";
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
import { useSWRConfig } from "swr";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useRouter } from "next/router";
import InvitesHeader from "../components/Invites/InvitesHeader";
import InvitesContent from "../components/Invites/InvitesContent";
import Loader from "../components/Loader";

export default function Invites() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [session, loading]: CustomSession = useSession();
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return null;
  }

  if (isUserError) {
<<<<<<< HEAD
<<<<<<< HEAD
    return <Login desiredPageText={"your invites"} />;
=======
    return (
      <Login
        callbackUrl={`${process.env.PLUTOMI_URL}/invites`}
        desiredPageText={"your invites"}
      />
    );
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
=======
    return <Login desiredPageText={"your invites"} />;
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  return (
    <>
      <SignedInNav current="Invites" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <InvitesHeader />
        </header>

        <main className="mt-5 ">
          <InvitesContent />
        </main>
      </div>
    </>
  );
}
