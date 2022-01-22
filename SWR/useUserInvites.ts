import useSWR from "swr";
import { GetUserInvites } from "../adapters/Invites";
import { SWRFetcher } from "../Config";

export default function useOrgInvites(userId: string) {
  const { data, error } = useSWR(userId && GetUserInvites(), SWRFetcher, {
    refreshInterval: 5000,
  });

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}
