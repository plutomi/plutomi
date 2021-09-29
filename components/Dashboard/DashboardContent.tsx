import EmptyOrgState from "./EmptyOrgState";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";

export default function DashboardContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);

  return (
    <div>
      You&apos;re in the <strong>{user?.org_id}</strong> org. Feel free to click
      around!
    </div>
  );
}
