import axios from "../axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
import OpeningsService from "../adapters/OpeningsService";

export default function useOpeningById(openingId: string) {
  const shouldFetch = openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && OpeningsService.getOpeningURL(openingId),
    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
