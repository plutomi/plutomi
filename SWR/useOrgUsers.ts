// Retrieves all users in an org
import axios from "axios";
import useSWR from "swr";
import OrgsService from "../adapters/OrgsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOrgUsers(org_id: string): useOrgUsersOutput {
  const shouldFetch = org_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OrgsService.getAllUsersInOrgURL({ org_id }),
    fetcher
  );

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}

export default useOrgUsers;
