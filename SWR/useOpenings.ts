import useSWR from "swr";
import { GetAllOpeningsInOrgURL } from "../adapters/Openings";
import { SWRFetcher } from "../Config";

export default function useOpenings() {
  const { data, error } = useSWR(GetAllOpeningsInOrgURL(), SWRFetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}
