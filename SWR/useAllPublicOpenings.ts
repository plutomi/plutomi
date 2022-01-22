import useSWR from "swr";
import { GetAllPublicOpeningsURL } from "../adapters/PublicInfo";
import { SWRFetcher } from "../Config";

export default function useAllPublicOpenings(orgId?: string) {
  const { data, error } = useSWR(
    orgId && GetAllPublicOpeningsURL(orgId),
    SWRFetcher
  );

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
}
