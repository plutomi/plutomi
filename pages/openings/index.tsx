import SignedInNav from "../../components/Navbar/SignedInNav";
import OpeningsHeader from "../../components/Openings/OpeningsHeader";
import { useSession } from "next-auth/client";
import useOpenings from "../../SWR/useOpenings";
import useUser from "../../SWR/useUser";
import Loader from "../../components/Loader";
import SignIn from "../../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import useStore from "../../utils/store";
import CreateOpeningModal from "../../components/Openings/OpeningModal";
import OpeningsContent from "../../components/Openings/OpeningsContent";
import EmptyOpeningsState from "../../components/Openings/EmptyOpeningsState";
import UpdateOpening from "../../utils/openings/updateOpening";
export default function Openings() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return <Loader text="Loading..." />;
  }

  // If no session or bad userid
  if (!session || isUserError) {
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

  // TODO loader bug again, styles not being applied when going from dashboard to here
  // I think its because it's trying to get the  path but it's not there for a fraction of a second
  if (isOpeningsLoading) {
    return <Loader text="Loading openings..." />;
  }

  const createOpening = async () => {
    const body: APICreateOpeningInput = {
      GSI1SK: openingModal.GSI1SK,
      is_public: openingModal.is_modal_open,
    };
    try {
      const { data } = await axios.post("/api/openings", body);
      alert(data.message);
      setOpeningModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        is_public: false,
        opening_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(`/api/openings/`); // Get all openings
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
          {openings.length == 0 ? <EmptyOpeningsState /> : <OpeningsContent />}
        </main>
      </div>
    </>
  );
}
