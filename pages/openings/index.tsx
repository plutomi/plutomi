import SignedInNav from "../../components/Navbar/SignedInNav";
import OpeningsHeader from "../../components/Openings/OpeningsHeader";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import Loader from "../../components/Loader";
import SignIn from "../../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import useStore from "../../utils/store";
import CreateOpeningModal from "../../components/Openings/OpeningModal";
import OpeningsContent from "../../components/Openings/OpeningsContent";
import EmptyOpeningsState from "../../components/Openings/EmptyOpeningsState";
import OpeningsService from "../../adapters/OpeningsService";
export default function Openings() {
  const { user, isUserLoading, isUserError } = useSelf();
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    return <Loader text="Loading..." />;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/openings`} // TODO set this
        desiredPage={"your openings"} // TODO set this
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }

  const createOpening = async () => {
    try {
      const { message } = await OpeningsService.createOpening({
        GSI1SK: openingModal.GSI1SK,
      });

      alert(message);

      setOpeningModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        is_public: false,
        opening_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    mutate(OpeningsService.getAllOpeningsURL()); // Get all openings
  };

  return (
    <>
      <CreateOpeningModal createOpening={createOpening} />
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-6 rounded-lg min-h-screen ">
        <header>
          <OpeningsHeader />
        </header>

        <main className="mt-5">
          {openings?.length == 0 ? <EmptyOpeningsState /> : <OpeningsContent />}
        </main>
      </div>
    </>
  );
}
