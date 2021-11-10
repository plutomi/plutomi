// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
import OpeningsService from "../adapters/OpeningsService";
/**
 *
 * @param user_id - The ID of the logged in user
 * @param openingId - The opening ID that you want to look up
 */
function useOpeningById(openingId: string): useOpeningByIdOutput {
  const shouldFetch = openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getOpeningURL({ openingId }),
    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default useOpeningById;
