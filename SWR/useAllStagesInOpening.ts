import useSWR from 'swr';
import { GetStagesInOpeningURL } from '../adapters/Stages';
import { SWRFetcher } from '../Config';
import { Stage } from '../entities';
import { APIErrorResponse } from '../@types/express';

interface UseAllStagesInOpeningProps {
  openingId?: string;
}

export const useAllStagesInOpening = ({ openingId }: UseAllStagesInOpeningProps) => {
  const { data, error } = useSWR<Stage[], APIErrorResponse>(
    openingId && GetStagesInOpeningURL(openingId),
    SWRFetcher,
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
};
