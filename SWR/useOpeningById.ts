import useSWR from "swr";
import { GetOpeningByIdURL } from "../adapters/Openings";
import { SWRFetcher } from "../Config";

export default function useOpeningById(openingId?: string) {
  const { data, error } = useSWR(
    openingId && GetOpeningByIdURL(openingId),
    SWRFetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
