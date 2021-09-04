import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function useUser() {
  const { data, error } = useSWR(`/api/users/self`, fetcher);

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
}

export default useUser;
