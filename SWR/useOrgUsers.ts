import useSWR from "swr";
import { GetUsersInOrgURL } from "../adapters/Users";
import { SWRFetcher } from "../Config";

export default function useOrgUsers(orgId?: string) {
  const { data, error } = useSWR(orgId && GetUsersInOrgURL(), SWRFetcher);

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
}
