import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOrgInvites(user_id: string) {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/users/${user_id}/invites` : null,
    fetcher
  );

  return {
    invites: data,
    isInvitesLoading: !error && !data,
    isInvitesError: error,
  };
}

export default useOrgInvites;
