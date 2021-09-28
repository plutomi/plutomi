// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 */
function useUser(user_id: string): useUserOutput {
  const shouldFetch = user_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch ? `/api/users/${user_id}` : null,
    fetcher
  );

  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
}

export default useUser;
