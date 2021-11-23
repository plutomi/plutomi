// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import OrgsService from "../Adapters/OrgsService";
import { DEFAULTS } from "../Config";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns private details about an org. Must be signed in
function usePrivateOrgById(orgId: string): useOrgOutput {
  const shouldFetch = orgId != DEFAULTS.NO_ORG ? true : false;

  // TODO make sure this org ID is being passed by the user
  const { data, error } = useSWR(
    shouldFetch && OrgsService.getOrgURL(orgId),
    fetcher
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}

export default usePrivateOrgById;
