// Retrieve a specific stage by ID
import axios from "axios";
import useSWR from "swr";
import StagesService from "../adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param userId - The ID of the logged in user
 * @param opening_id - The opening that you want to look in
 * @param stage_id - The stage which you want to retrieve
 */
function useStageById(stage_id: string): useStageByIdOutput {
  const shouldFetch = stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      StagesService.getStageURL({
        stage_id: stage_id,
      }),
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default useStageById;
