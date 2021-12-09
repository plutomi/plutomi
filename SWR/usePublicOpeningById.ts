import axios from "../axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function usePublicOpeningById(orgId: string, openingId: string) {
  const shouldFetch = orgId && openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicOpeningURL(orgId, openingId),

    fetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
