import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useStagesByOpeningId(
  user_id: string,
  opening_id: string
): useAllStagesInOpeningOutput {
  const shouldFetch = user_id && opening_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/openings/${opening_id}/stages` : null,
    fetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}

export default useStagesByOpeningId;
