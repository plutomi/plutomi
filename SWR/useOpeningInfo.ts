import useSWR from "swr";
import { GetOpeningInfoURL } from "../adapters/Openings";
import { SWRFetcher } from "../Config";

export default function useOpeningInfo(openingId: string) {
  const shouldFetch = openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && GetOpeningInfoURL(openingId),
    SWRFetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
