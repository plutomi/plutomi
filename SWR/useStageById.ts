// Retrieve a specific stage by ID
import axios from "axios";
import useSWR from "swr";
import StagesService from "../adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param userId - The ID of the logged in user
 * @param openingId - The opening that you want to look in
 * @param stageId - The stage which you want to retrieve
 */
function useStageById(stageId: string): useStageByIdOutput {
  const shouldFetch = stageId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getStageURL(stageId),
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default useStageById;
