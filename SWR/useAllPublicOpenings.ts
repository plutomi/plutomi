// Retrieves all public openings at https://plutomi.com/`org-id`/apply
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param orgId - The org which you want to return the openings for
 */
function useAllPublicOpenings(orgId: string): usePublicOpeningsOutput {
  const shouldFetch = orgId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getAllPublicOpeningsURL({ orgId }),
    fetcher
  );

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
}

export default useAllPublicOpenings;
