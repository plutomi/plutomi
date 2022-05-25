import useSWR from 'swr';
import { GetOrgInvitesURL } from '../adapters/Invites';
import { SWRFetcher } from '../Config';

export default function useOrgInvites(orgId: string) {
  const { data, error } = useSWR(orgId && GetOrgInvitesURL(orgId), SWRFetcher);

  return {
    pendingOrgInvites: data,
    isPendingOrgInvitesLoading: !error && !data,
    isPendingOrgInvitesError: error,
  };
}
