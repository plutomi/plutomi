// Retrieves all users in an org
import axios from "axios";
import useSWR from "swr";
import OrgsService from "../adapters/OrgsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOrgUsers(orgId: string): useOrgUsersOutput {
  const shouldFetch = orgId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OrgsService.getAllUsersInOrgURL(orgId),
    fetcher
  );

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}

export default useOrgUsers;
