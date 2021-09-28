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
import CreateOpeningModal from "../../components/CreateOpeningModal";
import OpeningsContent from "../../components/Openings/OpeningsContent";
import EmptyOpeningsState from "../../components/Openings/EmptyOpeningsState";
export default function Openings() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const setCreateOpeningModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOpeningModalOpen
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

  const createOpening = async ({
    opening_name,
    is_public,
  }: APICreateOpeningInput) => {
    const body: APICreateOpeningInput = {
      opening_name: opening_name,
      is_public: is_public,
    };
    try {
      const { data } = await axios.post("/api/openings", body);
      alert(data.message);
      setCreateOpeningModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(`/api/openings/`); // Get all openings
  };

  return (
    <>
      <CreateOpeningModal createOpening={createOpening} />
      <SignedInNav current="Openings" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
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
