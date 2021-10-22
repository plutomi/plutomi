import Loader from "../components/Loader";
import DashboardContent from "../components/Dashboard/DashboardContent";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import SignedInNav from "../components/Navbar/SignedInNav";
import { useSession } from "next-auth/client";
import useSelf from "../SWR/useSelf";
import SignIn from "../components/SignIn";
import axios from "axios";
import { mutate } from "swr";
import OrgsService from "../adapters/OrgsService";
import useStore from "../utils/store";
import CreateOrgModal from "../components/CreateOrgModal";
import EmptyOrgState from "../components/Dashboard/EmptyOrgState";
import UsersService from "../adapters/UsersService";

export default function Dashboard() {
  const { user, isUserLoading, isUserError } = useSelf();
  const setCreateOrgModalOpen = useStore(
    (state: PlutomiState) => state.setCreateOrgModalOpen
  );
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isUserLoading) {
    <Loader text="Loading ..." />;
  }

  if (isUserError) {
    return (
      <SignIn
        callbackUrl={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/dashboard`} 
        desiredPage={"your dashboard"} 
      />
    );
  }

  if (isUserLoading) {
    return <Loader text="Loading user..." />;
  }
  const createOrg = async ({ GSI1SK, org_id }) => {
    if (
      !confirm( // TODO add clean org name here
        `Your org id will be '${org_id.toLowerCase()}', this CANNOT be changed. Do you want to continue?`
      )
    ) {
      return;
    }

    try {
      const { message } = await OrgsService.createOrg({
        GSI1SK: GSI1SK,
        org_id: org_id,
      });
      alert(message);
      setCreateOrgModalOpen(false);
    } catch (error) {
      alert(error.response.data.message);
    }

    mutate(UsersService.getSelfURL());
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
