import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useOrgInvites(user_id: string) {
  const { data, error } = useSWR(`/api/users/${user_id}/invites`, fetcher);

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export default useOrgInvites;
