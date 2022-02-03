import useSWR from "swr";
import { SWRFetcher } from "../Config";
import { GetPublicOpeningInfoURL } from "../adapters/PublicInfo";
export default function usePublicOpeningById(
  orgId?: string,
  openingId?: string
) {
  const shouldFetch = orgId && openingId;

  const { data, error } = useSWR(
    shouldFetch && GetPublicOpeningInfoURL({ orgId, openingId }),

    SWRFetcher
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
}
