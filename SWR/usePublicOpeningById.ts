// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../Adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details an org's public opening
// User does not need to be signed in
function usePublicOpeningById(
  orgId: string,
  openingId: string
): useOpeningByIdOutput {
  const shouldFetch = orgId && openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicOpeningURL(orgId, openingId),

    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default usePublicOpeningById;
