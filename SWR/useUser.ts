import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useUser(id: string): useUserOutput {
  const shouldFetch = id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/users/${id}` : null,
    fetcher
  );

  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
}

export default useUser;
