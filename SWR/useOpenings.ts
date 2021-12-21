import axios from "../utils/axios";
import useSWR from "swr";
import OpeningsService from "../adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useOpenings() {
  const { data, error } = useSWR(OpeningsService.getAllOpeningsURL(), fetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}
