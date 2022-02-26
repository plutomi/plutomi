import useSelf from "../../SWR/useSelf";
import useOrgUsers from "../../SWR/useOrgUsers";
import Loader from "../Loader";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import CreateInviteModal from "../CreateInviteModal";
import usePendingOrgInvites from "../../SWR/usePendingOrgInvites";
import { DynamoOrgInvite } from "../../types/dynamo";
export default function WebhooksContent() {
  // TODO clean up the pending invites section up
  const { user, isUserLoading, isUserError } = useSelf();

  return (
    <>
      <h1>Webhooks Content</h1>
    </>
  );
}
