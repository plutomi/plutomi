import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useSelf from "../SWR/useSelf";
import useOrgInvites from "../SWR/useOrgInvites";
import { useSWRConfig } from "swr";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useRouter } from "next/router";
import InvitesHeader from "../components/Invites/InvitesHeader";
import InvitesContent from "../components/Invites/InvitesContent";
import Loader from "../components/Loader";

export default function Invites() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [session, loading]: CustomSession = useSession();
  const { user, isUserLoading, isUserError } = useSelf();

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return null;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/invites`}
        desiredPage={"your invites"}
      />
    );
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
