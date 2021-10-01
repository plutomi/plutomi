import EmptyOrgState from "./EmptyOrgState";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import usePrivateOrgById from "../../SWR/usePrivateOrgById";
export default function DashboardContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  return (
    <div>
      You&apos;re in the <strong>{org?.GSI1SK}</strong> org. Feel free to click
      around!
    </div>
  );
}
