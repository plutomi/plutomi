import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useFunnelById(user_id: string, funnel_id: string) {
  const shouldFetch = user_id && funnel_id ? true : false;

  const { data, error } = useSWR(shouldFetch ? `/api/funnels/${funnel_id}/stages` : null, fetcher);

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}

export default useFunnelById;
