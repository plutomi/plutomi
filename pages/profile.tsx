import SignedInNav from "../components/Navbar/SignedInNav";
import OpeningsHeader from "../components/Openings/OpeningsHeader";
import { useSession } from "next-auth/client";
import useOpenings from "../SWR/useOpenings";
import useUser from "../SWR/useUser";
import EmptyTeamState from "../components/Team/EmptyTeamState";
import axios from "axios";
import UserProfileHeader from "../components/UserProfile/UserProfileHeader";
import { mutate } from "swr";
import UserProfileModal from "../components/UserProfile/UserProfileModal";
import TeamContent from "../components/Team/TeamContent";
import Loader from "../components/Loader";
import SignIn from "../components/SignIn";
import CreateInviteModal from "../components/CreateInviteModal";
import useOrgUsers from "../SWR/useOrgUsers";
import useStore from "../utils/store";
import TeamHeader from "../components/Team/TeamHeader";
import { useRouter } from "next/router";
export default function Team() {
  const router = useRouter();
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { orgUsers, isOrgUsersLoading, isOrgUsersError } = useOrgUsers(
    user?.org_id,
    user?.user_id
  );
  const userProfileModal = useStore(
    (state: PlutomiState) => state.userProfileModal
  );

  const setUserProfileModal = useStore(
    (state: PlutomiState) => state.setUserProfileModal
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/team`} // TODO set this
        desiredPage={"your team"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  // TODO fix types
  const updateUser = async () => {
    try {
      const body = {
        updated_user: {
          ...user,
          first_name: userProfileModal.first_name,
          last_name: userProfileModal.last_name,
          GSI1SK: `${userProfileModal.first_name} ${userProfileModal.last_name}`,
        },
      };
      setUserProfileModal({
        ...userProfileModal,
        is_modal_open: false,
      });
      const { data } = await axios.put(`/api/users/${user?.user_id}`, body);
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(`/api/users/${user?.user_id}`);
  };

  return (
    <>
      <UserProfileModal updateUser={updateUser} />
      <SignedInNav current="PLACEHOLDER" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <UserProfileHeader />
        </header>

        <main className="mt-5">
          <h1 className="text-2xl font-bold text-dark">
            There&apos;s not much here... yet!
          </h1>
        </main>
      </div>
    </>
  );
}
