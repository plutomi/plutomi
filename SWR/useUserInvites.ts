import useSWR from 'swr';
import { GetUserInvitesURL } from '../adapters/Invites';
import { SWRFetcher } from '../Config';

export default function useUserInvites(userId: string) {
  const { data, error } = useSWR(userId && GetUserInvitesURL(), SWRFetcher, {
    refreshInterval: 5000,
  });

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}
