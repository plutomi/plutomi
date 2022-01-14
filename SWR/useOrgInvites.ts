import axios from "../utils/axios";
import useSWR from "swr";
import InvitesService from "../adapters/InvitesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useOrgInvites(userId: string) {
  const shouldFetch = userId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && InvitesService.getInvitesURL(userId),
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}
