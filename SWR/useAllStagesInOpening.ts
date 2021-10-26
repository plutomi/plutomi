// Retrieves all stages in an opening
import axios from "axios";
import useSWR from "swr";
import StagesService from "../adapters/StagesService";
import OpeningsService from "../adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - Requires a logged in user_id to view all stages in an opening
 * @param opening_id - The ID of the opening that you want to look up
 */
function useAllStagesInOpening(
  opening_id: string
): useAllStagesInOpeningOutput {
  const shouldFetch =  opening_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      OpeningsService.getAllStagesInOpeningURL({
        opening_id: opening_id,
      }),
    fetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}

export default useAllStagesInOpening;
