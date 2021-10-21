// Retrieves all openings in an org, public or private
import axios from "axios";
import useSWR from "swr";
import OpeningsService from "../adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 */
function useOpenings(user_id: string): useOpeningsOutput {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getAllOpeningsURL(),
    fetcher
  );

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}

export default useOpenings;
