// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
import OpeningsService from "../adapters/OpeningsService";
/**
 *
 * @param userId - The ID of the logged in user
 * @param opening_id - The opening ID that you want to look up
 */
function useOpeningById(opening_id: string): useOpeningByIdOutput {
  const shouldFetch = opening_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getOpeningURL({ opening_id }),
    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default useOpeningById;
