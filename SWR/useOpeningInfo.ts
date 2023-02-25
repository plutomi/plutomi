import useSWR from 'swr';
import { APIErrorResponse } from '../@types/apiErrorResponse';
import { GetOpeningInfoURL } from '../adapters/Openings';
import { SWRFetcher } from '../Config';
import { OpeningEntity } from '../@types/entities/application';

interface UseOpeningInfoProps {
  openingId?: string;
}

export const useOpeningInfo = ({ openingId }: UseOpeningInfoProps) => {
  const { data, error } = useSWR<OpeningEntity, APIErrorResponse>(
    openingId && GetOpeningInfoURL(openingId),
    SWRFetcher,
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
};
