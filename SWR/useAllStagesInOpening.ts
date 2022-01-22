import useSWR from "swr";
import { GetAllStagesInOpening } from "../adapters/Stages";
import { SWRFetcher } from "../Config";

export default function useAllStagesInOpening(openingId?: string) {
  const { data, error } = useSWR(
    openingId && GetAllStagesInOpening(openingId),
    SWRFetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}
