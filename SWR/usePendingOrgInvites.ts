import useSWR from 'swr';
import { GetOrgInvitesURL } from '../adapters/Invites';
import { SWRFetcher } from '../Config';
import { DynamoOrgInvite } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseOrgInviteProps {
  orgId?: string;
}
export const usePendingOrgInvites = ({ orgId }: UseOrgInviteProps) => {
  const { data, error } = useSWR<DynamoOrgInvite[], APIErrorResponse>(
    orgId && GetOrgInvitesURL(orgId),
    SWRFetcher,
  );

  return {
    pendingOrgInvites: data,
    isPendingOrgInvitesLoading: !error && !data,
    isPendingOrgInvitesError: error,
  };
};
