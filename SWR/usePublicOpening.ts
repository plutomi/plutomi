import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetPublicOpeningInfoURL } from '../adapters/PublicInfo';
import { DynamoOpening } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UsePublicOpeningProps {
  orgId?: string;
  openingId?: string;
}

export const usePublicOpening = ({ orgId, openingId }: UsePublicOpeningProps) => {
  const shouldFetch = orgId && openingId;
  // TODO replace with public opening type
  const { data, error } = useSWR<DynamoOpening, APIErrorResponse>(
    shouldFetch && GetPublicOpeningInfoURL({ orgId, openingId }),
    SWRFetcher,
  );

  return {
    opening: data,
    isOpeningLoading: !error && !data,
    isOpeningError: error,
  };
};
