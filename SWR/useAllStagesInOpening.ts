import useSWR from 'swr';
import { GetStagesInOpeningURL } from '../adapters/Stages';
import { SWRFetcher } from '../Config';
import { DynamoStage } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseAllStagesInOpeningProps {
  openingId?: string;
}

export const useAllStagesInOpening = ({ openingId }: UseAllStagesInOpeningProps) => {
  const { data, error } = useSWR<DynamoStage[], APIErrorResponse>(
    openingId && GetStagesInOpeningURL(openingId),
    SWRFetcher,
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
};
