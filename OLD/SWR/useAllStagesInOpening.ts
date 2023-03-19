import useSWR from 'swr';
import { APIErrorResponse } from '../../@types/apiErrorResponse';
import { GetStagesInOpeningURL } from '../.vscode/adapters/Stages';
import { SWRFetcher } from '../../Config';
import { StageEntity } from '../models';

interface UseAllStagesInOpeningProps {
  openingId?: string;
}

export const useAllStagesInOpening = ({ openingId }: UseAllStagesInOpeningProps) => {
  const { data, error } = useSWR<StageEntity[], APIErrorResponse>(
    openingId && GetStagesInOpeningURL(openingId),
    SWRFetcher,
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
};
