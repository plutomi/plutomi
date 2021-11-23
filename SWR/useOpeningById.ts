// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
import OpeningsService from "../Adapters/OpeningsService";
/**
 *
 * @param userId - The ID of the logged in user
 * @param openingId - The opening ID that you want to look up
 */
function useOpeningById(openingId: string) {
  console.log("Getting opening id");
  const shouldFetch = openingId ? true : false;
  console.log("Should fetch"), shouldFetch;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getOpeningURL(openingId),
    fetcher
  );
  console.log("DATA", data);

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default useOpeningById;
