import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOpeningById(user_id: string, opening_id: string): useOpeningByIdOutput {
  const shouldFetch = user_id && opening_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/openings/${opening_id}` : null,
    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}

export default useOpeningById;
