import useSWR from 'swr';
import { GetOpeningInfoURL } from '../adapters/Openings';
import { SWRFetcher } from '../Config';
import { Opening } from '../entities';
import { APIErrorResponse } from '../types/main';

interface UseOpeningInfoProps {
  openingId?: string;
}

export const useOpeningInfo = ({ openingId }: UseOpeningInfoProps) => {
  const { data, error } = useSWR<Opening, APIErrorResponse>(
    openingId && GetOpeningInfoURL(openingId),
    SWRFetcher,
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
};
