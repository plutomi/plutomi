// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details about an org
// seen at plutomi.com/[org_id]/apply
function usePublicOrgById(org_id: string): useOrgOutput {
  const shouldFetch = org_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicOrgURL({ org_id }),
    fetcher
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}

export default usePublicOrgById;
