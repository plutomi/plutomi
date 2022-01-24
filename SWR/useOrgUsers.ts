import useSWR from "swr";
import { GetAllUsersInOrgURL } from "../adapters/Users";
import { SWRFetcher } from "../Config";

export default function useOrgUsers(orgId?: string) {
  const { data, error } = useSWR(orgId && GetAllUsersInOrgURL(), SWRFetcher);

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}
