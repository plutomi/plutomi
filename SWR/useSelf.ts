import axios from "axios";
import useSWR from "swr";
import UsersService from "../adapters/UsersService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useSelf() {
  const { data, error } = useSWR(UsersService.getSelfURL(), fetcher);
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
}

export default useSelf;
