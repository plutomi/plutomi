// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details an org's public opening
// User does not need to be signed in
function usePublicOpeningById(
  org_id: string,
  opening_id: string
): useOpeningByIdOutput {
  const shouldFetch = org_id && opening_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && `/api/public/orgs/${org_id}/openings/${opening_id}`,
    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default usePublicOpeningById;
