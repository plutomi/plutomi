import Layout from "../components/Layout";
import GoBack from "../components/GoBackButton";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../SWR/useUser";
import SignIn from "../components/SignIn";
import DashboardContent from "../components/Dashboard/DashboardContent";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
export default function Dashboard() {
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
        desiredPage={"your dashboard"} // TODO set this
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
      <SignedInNav current="Dashboard" user={user ? user : null} />
      <Layout
        header={<DashboardHeader name={user.first_name} />}
        main={<DashboardContent user={user} />}
        footer={null}
      />
    </>
  );
}
