import useSWR from "swr";
import { GetAllStagesInOpening } from "../adapters/Stages";
import { SWRFetcher } from "../Config";

export default function useAllStagesInOpening(openingId?: string) {
  const shouldFetch = openingId ? true : false;
  const { data, error } = useSWR(
    shouldFetch && GetAllStagesInOpening(openingId),
    SWRFetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}
