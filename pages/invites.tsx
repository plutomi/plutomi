import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import useOrgInvites from "../SWR/useOrgInvites";
import { GetRelativeTime } from "../utils/time";
import axios from "axios";
import { useSWRConfig } from "swr";
import GoBack from "../components/Buttons/GoBackButton";
import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useRouter } from "next/router";
import usePublicOrgById from "../SWR/usePublicOrgById";
import InvitesHeader from "../components/Invites/InvitesHeader";
import InvitesContent from "../components/Invites/InvitesContent";

export default function Invites() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [session, loading]: CustomSession = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { invites, isInvitesLoading, isInvitesError } = useOrgInvites(
    session?.user_id
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/invites`}
        desiredPage={"your invites"}
      />
    );
  }

  if (isUserLoading) {
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <SignedInNav current="Invites" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <InvitesHeader />
        </header>

        <main className="mt-5 ">
          {/* {openings?.length == 0 ? <EmptyOpeningsState /> : <OpeningsContent />} */}
          <InvitesContent />
        </main>
      </div>
    </>
  );
}
