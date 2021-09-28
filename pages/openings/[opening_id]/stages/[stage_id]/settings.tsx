import SignedInNav from "../../../../../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../../../../../SWR/useUser";
import Loader from "../../../../../components/Loader";
import OpeningSettingsHeader from "../../../../../components/Openings/OpeningSettingsHeader";
import SignIn from "../../../../../components/SignIn";
import useOpeningById from "../../../../../SWR/useOpeningById";
import { useRouter } from "next/router";
import useStageById from "../../../../../SWR/useStageById";
import OpeningSettingsContent from "../../../../../components/Openings/OpeningSettingsContent";
import StageSettingsHeader from "../../../../../components/Stages/StageSettingsHeader";
import StageSettingsContent from "../../../../../components/Stages/StagesSettingsContent";
export default function OpeningsSettings() {
  const router = useRouter();
  const { opening_id, stage_id } = router.query;
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { opening, isOpeningLoading, isOpeningError } = useOpeningById(
    user?.user_id,
    opening_id as string
  );
  const { stage, isStageLoading, isStageError } = useStageById(
    user?.user_id,
    opening?.opening_id,
    stage_id as string
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings/${opening_id}/settings`} // TODO set this
        desiredPage={"your opening"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStageLoading) {
    return <Loader text="Loading stage info..." />;
  }

  return (
    <>
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <StageSettingsHeader />
        </header>

        <main className="mt-5">
          <StageSettingsContent />
        </main>
      </div>
    </>
  );
}
