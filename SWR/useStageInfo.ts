import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetStageInfoURL } from '../adapters/Stages';
import { DynamoStage } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseStageInfoProps {
  openingId?: string;
  stageId?: string;
}
export const useStageInfo = ({ openingId, stageId }: UseStageInfoProps) => {
  const shouldFetch = openingId && stageId;

  const { data, error } = useSWR<DynamoStage, APIErrorResponse>(
    shouldFetch &&
      GetStageInfoURL({
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
