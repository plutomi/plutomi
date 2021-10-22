import SignedInNav from "../../../components/Navbar/SignedInNav";
<<<<<<< HEAD
=======
import { useSession } from "next-auth/client";
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
import useSelf from "../../../SWR/useSelf";
import Loader from "../../../components/Loader";
import OpeningSettingsHeader from "../../../components/Openings/OpeningSettingsHeader";
import Login from "../../../components/Login";
import useOpeningById from "../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import OpeningSettingsContent from "../../../components/Openings/OpeningSettingsContent";
export default function OpeningsSettings() {
  const router = useRouter();
<<<<<<< HEAD
  const { opening_id } = router.query as CustomQuery;
=======
  const { opening_id } = router.query;
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
<<<<<<< HEAD
    return <Login desiredPageText={"your opening settings"} />;
=======
    return (
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/openings/${
          opening_id as string
        }/settings`} // TODO set this
        desiredPage={"your opening settings"}
      />
    );
>>>>>>> dd45c08 (replaced next-auth with next-iron-session)
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  return (
    <>
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <OpeningSettingsHeader />
        </header>

        <main className="mt-5">
          <OpeningSettingsContent />
        </main>
      </div>
    </>
  );
}
