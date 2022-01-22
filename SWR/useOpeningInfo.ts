import useSWR from "swr";
import { GetOpeningInfoURL } from "../adapters/Openings";
import { SWRFetcher } from "../Config";

export default function useOpeningInfo(openingId?: string) {
  const { data, error } = useSWR(
    openingId && GetOpeningInfoURL(openingId),
    SWRFetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
