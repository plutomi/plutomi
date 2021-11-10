// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details about an org
// seen at plutomi.com/[orgId]/apply
function usePublicOrgById(orgId: string): useOrgOutput {
  const shouldFetch = orgId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicOrgURL({ orgId }),
    fetcher
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}

export default usePublicOrgById;
