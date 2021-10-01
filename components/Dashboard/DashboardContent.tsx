import EmptyOrgState from "./EmptyOrgState";
import { useSession } from "next-auth/client";
import useUser from "../../SWR/useUser";
import { useState } from "react";
import usePrivateOrgById from "../../SWR/usePrivateOrgById";
import { CheckIcon, ClipboardCopyIcon } from "@heroicons/react/outline";
export default function DashboardContent() {
  const [session, loading]: [CustomSession, boolean] = useSession();
  const { user, isUserLoading, isUserError } = useUser(session?.user_id);
  const { org, isOrgLoading, isOrgError } = usePrivateOrgById(user?.org_id);
  const [copied, setCopied] = useState(false);
  const custom_apply_link = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${org?.org_id}/apply`;

  const handleCopy = () => {
    navigator.clipboard.writeText(custom_apply_link);
    setCopied(true);
  };
  return (
    <div>
      <h1 className="text-2xl">
        You&apos;re in the <strong>{org?.GSI1SK}</strong> org. Feel free to
        click around!
      </h1>
      <div className="flex items-center mt-4">
        <p className="text-normal text-md">Your custom apply link is {custom_apply_link} </p>

        <button
          className="px-4 rounded-full text-blue-500 hover:text-blue-800 transition ease-in duration-200"
          onClick={handleCopy}
        >
          {copied ? (
            <p className="text-light inline-flex space-x-3">
              Copied{" "}
              <span className="text-emerald-500">
                <CheckIcon className="h-6 w-6 " />
              </span>
            </p>
          ) : (
            <ClipboardCopyIcon className="h-6 w-6 " />
          )}
        </button>
      </div>
    </div>
  );
}
