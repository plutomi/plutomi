import Layout from "../components/Layout";
import GoBack from "../components/GoBackButton";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import OpeningsHeader from "../components/Openings/OpeningsHeader";
import useUser from "../SWR/useUser";
import SignIn from "../components/SignIn";
import OpeningsContent from "../components/Openings/OpeningsContent";
import useOpenings from "../SWR/useOpenings";
export default function Openings() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~LOADING STATES START~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    return null;
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
    // TODO set this
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading...</h1>
      </div>
    );
  }

  if (isOpeningsLoading) {
    // TODO set this
    return (
      <div className="mx-auto p-20 flex justify-center items-center">
        <h1 className="text-4xl text-dark font-medium">Loading openings...</h1>
      </div>
    );
  }

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~LOADING STATES END~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  // TODO add openings loading state

  return (
    <>
      <SignedInNav current="Openings" user={user ? user : null} />
      <Layout
        header={<OpeningsHeader openings={openings} />}
        main={<OpeningsContent user={user} openings={openings} />}
        footer={null}
      />
    </>
  );
}
