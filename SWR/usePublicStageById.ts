// Retrieves a specific user by ID
import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetPublicStageInfoURL } from '../adapters/PublicInfo';
import { DynamoStage } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface usePublicStageByIdProps {
  orgId?: string;
  openingId?: string;
  stageId?: string;
}

export const usePublicStageById = ({ orgId, openingId, stageId }: usePublicStageByIdProps) => {
  const shouldFetch = orgId && openingId && stageId;

  const { data, error } = useSWR<DynamoStage, APIErrorResponse>(
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
};
