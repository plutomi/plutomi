// Retrieve a specific stage by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 * @param opening_id - The opening that you want to look in
 * @param stage_id - The stage which you want to retrieve
 */
function useStageById(
  user_id: string,
  opening_id: string,
  stage_id: string
): useStageByIdOutput {
  const shouldFetch = user_id && opening_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/openings/${opening_id}/stages/${stage_id}` : null,
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default useStageById;
