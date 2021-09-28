// Retrieves all public openings at https://plutomi.com/`org-id`/apply
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param org_id - The org which you want to return the openings for
 */
function useAllPublicOpenings(org_id: string): usePublicOpeningsOutput {
  const shouldFetch = org_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/orgs/${org_id}/openings` : null,
    fetcher
  );

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
}

export default useAllPublicOpenings;
