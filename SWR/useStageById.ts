import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useStagesByFunnelId(
  user_id: string,
  funnel_id: string,
  stage_id: string
) {
  const shouldFetch = user_id && funnel_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/funnels/${funnel_id}/stages/${stage_id}` : null,
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default useStagesByFunnelId;
