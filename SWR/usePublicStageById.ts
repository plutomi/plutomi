// Retrieves a specific user by ID
import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetPublicStageInfoURL } from '../adapters/PublicInfo';

export default function usePublicStageById(orgId?: string, openingId?: string, stageId?: string) {
  // TODO i think this can be refactored since we no longer need th eopening ID
  const shouldFetch = orgId && openingId && stageId;

  const { data, error } = useSWR(
    shouldFetch &&
      GetPublicStageInfoURL({
        orgId,
        openingId,
        stageId,
      }),
    SWRFetcher,
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}
