import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetStageInfoURL } from '../adapters/Stages';
import { StageEntity } from '../models';
import { APIErrorResponse } from '../@types/apiErrorResponse';

interface UseStageInfoProps {
  openingId?: string;
  stageId?: string;
}
export const useStageInfo = ({ openingId, stageId }: UseStageInfoProps) => {
  const shouldFetch = openingId && stageId;

  const { data, error } = useSWR<StageEntity, APIErrorResponse>(
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
