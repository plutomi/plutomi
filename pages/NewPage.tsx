// Template for creating new pages
import Layout from "../components/Layout";
import GoBack from "../components/GoBackButton";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../SWR/useUser";
import SignIn from "../components/SignIn";
export default function NewPage() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

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
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`} // TODO set this
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

  /** ~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~LOADING STATES END~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   * ~~~~~~~~~~~~~~~~~~~~~~~~
   */

  return (
    <>
      {" "}
      {/* SET THIS */}
      <SignedInNav current="PLACEHOLDER" user={user ? user : null} />
      <GoBack />
      <Layout
        headerText={"New Page"}
        main={<div>Testing</div>}
        footer={<h1>Footer</h1>}
      />
    </>
  );
}
