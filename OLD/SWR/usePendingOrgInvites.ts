import useSWR from 'swr';
import { APIErrorResponse } from '../../@types/apiErrorResponse';
import { GetOrgInvitesURL } from '../.vscode/adapters/Invites';
import { SWRFetcher } from '../../Config';
import { InviteEntity } from '../models';

interface UseOrgInviteProps {
  orgId?: string;
}
export const usePendingOrgInvites = ({ orgId }: UseOrgInviteProps) => {
  const { data, error } = useSWR<InviteEntity[], APIErrorResponse>(
    orgId && GetOrgInvitesURL(orgId),
    SWRFetcher,
  );

  return {
    pendingOrgInvites: data,
    isPendingOrgInvitesLoading: !error && !data,
    isPendingOrgInvitesError: error,
  };
};
