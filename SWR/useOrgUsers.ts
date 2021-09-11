import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useOrgUsers(org_id: string) {
  const { data, error } = useSWR(`/api/orgs/${org_id}/users`, fetcher);

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}

export default useOrgUsers;
