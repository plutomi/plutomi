import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOpenings(user_id: string): useOpeningsOutput {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(shouldFetch ? `/api/openings` : null, fetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}

export default useOpenings;
