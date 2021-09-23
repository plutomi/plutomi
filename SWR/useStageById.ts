import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useStagesByOpeningId(
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

export default useStagesByOpeningId;
