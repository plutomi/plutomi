import EmptyOrgState from "./EmptyOrgState";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import { useState } from "react";
import ClickToCopy from "../ClickToCopy";
import usePrivateOrgById from "../../SWR/usePrivateOrgById";
export default function DashboardContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  const custom_apply_link = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${org?.org_id}/apply`;

  return (
    <div>
      <h1 className="text-2xl">
        You&apos;re in the <strong>{org?.GSI1SK}</strong> org. Feel free to
        click around!
      </h1>
      <div className="flex items-center mt-4 -ml-3 text-md">
        <ClickToCopy
          showText={"Copy Application Link"}
          copyText={custom_apply_link}
        />
      </div>
    </div>
  );
}
