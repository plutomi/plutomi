import SignedInNav from "../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useSelf from "../../../SWR/useSelf";
import Loader from "../../../components/Loader";
import OpeningSettingsHeader from "../../../components/Openings/OpeningSettingsHeader";
import SignIn from "../../../components/SignIn";
import useOpeningById from "../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import OpeningSettingsContent from "../../../components/Openings/OpeningSettingsContent";
export default function OpeningsSettings() {
  const router = useRouter();
  const { opening_id } = router.query;

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`} // TODO set this
        desiredPage={"your opening settings"} // TODO set this
      />
    );
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
