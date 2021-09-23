import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useOrgUsers(org_id: string): useOrgUsersOutput {
  const shouldFetch = org_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/orgs/${org_id}/users` : null,
    fetcher
  );

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}

export default useOrgUsers;
