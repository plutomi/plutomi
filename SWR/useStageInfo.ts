import useSWR from "swr";
import { SWRFetcher } from "../Config";
import { GetStageInfoURL } from "../adapters/Stages";
export default function useStageInfo(openingId: string, stageId: string) {
  const shouldFetch = openingId && stageId;

  const { data, error } = useSWR(
    shouldFetch && GetStageInfoURL(openingId, stageId),
    SWRFetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}
