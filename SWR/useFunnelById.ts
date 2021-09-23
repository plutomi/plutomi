import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useFunnelById(user_id: string, funnel_id: string): useFunnelByIdOutput {
  const shouldFetch = user_id && funnel_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/funnels/${funnel_id}` : null,
    fetcher
  );

  return {
    funnel: data,
    isFunnelLoading: !error && !data,
    isFunnelError: error,
  };
}

export default useFunnelById;
