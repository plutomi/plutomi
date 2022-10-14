import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetStageInfoURL } from '../adapters/Stages';
import { APIErrorResponse } from '../types/main';
import { Stage } from '../entities';

interface UseStageInfoProps {
  openingId?: string;
  stageId?: string;
}
export const useStageInfo = ({ openingId, stageId }: UseStageInfoProps) => {
  const shouldFetch = openingId && stageId;

  const { data, error } = useSWR<Stage, APIErrorResponse>(
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
