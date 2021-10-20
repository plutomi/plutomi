import Loader from "../components/Loader";
import DashboardContent from "../components/Dashboard/DashboardContent";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useUser from "../SWR/useUser";
import SignIn from "../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import useStore from "../utils/store";
import CreateOrgModal from "../components/CreateOrgModal";
import EmptyOrgState from "../components/Dashboard/EmptyOrgState";
import UsersService from "../Adapters/UsersService";

export default function Dashboard() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const setCreateOrgModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOrgModalOpen
  );
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) {
    <Loader text="Loading ..." />;
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
    return <Loader text="Loading user..." />;
  }
  const createOrg = async ({ GSI1SK, org_id }) => {
    if (
      !confirm(
        `Your org id will be '${org_id.toLowerCase()}', this CANNOT be changed. Do you want to continue?`
      )
    ) {
      return;
    }
    const body: APICreateOrgInput = {
      GSI1SK: GSI1SK,
      org_id: org_id,
    };
    try {
      const { data } = await axios.post("/api/orgs", body);
      alert(data.message);
      setCreateOrgModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getUserURL({ user_id: user?.user_id }));
  };

  return (
    <>
      <CreateOrgModal createOrg={createOrg} />
      <SignedInNav current="Dashboard" />
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <DashboardHeader />
        </header>

        <main className="mt-5">
          {user?.org_id === "NO_ORG_ASSIGNED" ? (
            <EmptyOrgState />
          ) : (
            <DashboardContent />
          )}
        </main>
      </div>
    </>
  );
}
