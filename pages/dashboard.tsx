import UserProfileCard from "../components/UserProfileCard";
import SignedInNav from "../components/Navbar/SignedInNav";
import CreateOrgModal from "../components/CreateOrgModal";
import { useSession } from "next-auth/client";
import SignIn from "../components/SignIn";
import useUser from "../SWR/useUser";
import useStore from "../utils/store";

export default function Dashboard() {
  const setCreateOrgModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOrgModalOpen
  );

  const isCreateOrgModalOpen = useStore(
    (state: PlutomiState) => state.createOrgModalIsOpen
  );
  const [session, loading]: [CustomSession, boolean] = useSession();

  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  const name = user?.GSI1SK;

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
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`}
        desiredPage={"your dashboard"}
      />
    );
  }

  if (isUserLoading) {
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
    <div className="min-h-screen bg-white">
      <SignedInNav current="Dashboard" user={user} />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {name.includes("NO_FIRST_NAME") ||
            name.includes("NO_FIRST_NAME") ? (
              <h1 className="text-4xl font-bold leading-tight text-gray-900">
                Welcome!
              </h1>
            ) : (
              <h1 className="text-4xl font-bold leading-tight text-gray-900">
                Hello {name}!
              </h1>
            )}
          </div>
        </header>
        <UserProfileCard user={user} />
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <CreateOrgModal />
            {user.org_id === "NO_ORG_ASSIGNED" && (
              <button
                onClick={() => setCreateOrgModalOpen(true)}
                className="border px-4 py-3 text-lg bg-blue-gray-200"
              >
                Create an org
              </button>
            )}

            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96" />
            </div>
            {/* /End replace */}
          </div>
        </main>
      </div>
    </div>
  );
}
