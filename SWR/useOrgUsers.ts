import axios from "../utils/axios";
import useSWR from "swr";
import OrgsService from "../adapters/OrgsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useOrgUsers(orgId: string) {
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
