import useSWR from 'swr';
import { GetUserInvitesURL } from '../.vscode/adapters/Invites';
import { SWRFetcher } from '../../Config';
import { DynamoOrgInvite, DynamoUser } from '../@types/dynamo';
import { APIErrorResponse } from '../../@types/express';

interface UseUserInvitesProps {
  userId?: string;
}
export const useUserInvites = ({ userId }: UseUserInvitesProps) => {
  const { data, error } = useSWR<DynamoOrgInvite[], APIErrorResponse>(
    userId && GetUserInvitesURL(),
    SWRFetcher,
    {
      refreshInterval: 5000,
    },
  );

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
};
