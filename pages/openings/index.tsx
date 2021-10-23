import SignedInNav from "../../components/Navbar/SignedInNav";
import OpeningsHeader from "../../components/Openings/OpeningsHeader";
import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import Loader from "../../components/Loader";
import Login from "../../components/Login";
<<<<<<< HEAD
<<<<<<< HEAD
=======
import axios from "axios";
>>>>>>> d64c806 (Got rid of callback url on login component)
=======
>>>>>>> 35ce39a (feat: Added ability to get all applicants by opening)
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
<<<<<<< HEAD
<<<<<<< HEAD
      <Login
        desiredPageText={"your openings"} // TODO set this
=======
      <SignIn
        callbackUrl={`${process.env.PLUTOMI_URL}/openings`} // TODO set this
        desiredPage={"your openings"} // TODO set this
>>>>>>> 73b8a24 (fixed wrong callback url on signin)
=======
      <Login
        desiredPageText={"your openings"} // TODO set this
>>>>>>> d64c806 (Got rid of callback url on login component)
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
