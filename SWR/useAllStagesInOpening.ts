import axios from "../axios";
import useSWR from "swr";
import OpeningsService from "../Adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useAllStagesInOpening(openingId: string) {
  const shouldFetch = openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getAllStagesInOpeningURL(openingId),
    fetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}
