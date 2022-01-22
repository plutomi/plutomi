// Retrieves a specific user by ID
import useSWR from "swr";
import { SWRFetcher } from "../Config";
import { GetPublicStageInfo } from "../adapters/PublicInfo";
export default function usePublicStageById( // TODO i think this can be refactored since we no longer need th eopening ID
  orgId?: string,
  openingId?: string,
  stageId?: string
) {
  const shouldFetch = orgId && openingId && stageId;

  const { data, error } = useSWR(
    shouldFetch && GetPublicStageInfo(orgId, openingId, stageId),
    SWRFetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}
