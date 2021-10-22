import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useSelf from "../SWR/useSelf";
import axios from "axios";
import UserProfileHeader from "../components/UserProfile/UserProfileHeader";
import { mutate } from "swr";
import UserProfileModal from "../components/UserProfile/UserProfileModal";
import Loader from "../components/Loader";
import SignIn from "../components/SignIn";
import useOrgUsers from "../SWR/useOrgUsers";
import useStore from "../utils/store";
import { useRouter } from "next/router";
import UsersService from "../adapters/UsersService";
export default function Team() {
  const { user, isUserLoading, isUserError } = useSelf();

  const userProfileModal = useStore(
    (state: PlutomiState) => state.userProfileModal
  );

  const setUserProfileModal = useStore(
    (state: PlutomiState) => state.setUserProfileModal
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/profile`} // TODO set this
        desiredPage={"your profile"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  // TODO fix types
  const updateUser = async () => {
    try {
      setUserProfileModal({
        ...userProfileModal,
        is_modal_open: false,
      });

      const { message } = await UsersService.updateUser({
        user_id: user?.user_id,
        new_user_values: {
          first_name: userProfileModal.first_name,
          last_name: userProfileModal.last_name,
          GSI1SK: `${userProfileModal.first_name} ${userProfileModal.last_name}`,
        },
      });
      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getSelfURL());
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
