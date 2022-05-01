import useSWR from 'swr';
import { GetPublicOpeningsURL } from '../adapters/PublicInfo';
import { SWRFetcher } from '../Config';

export default function useAllPublicOpenings(orgId?: string) {
  const { data, error } = useSWR(orgId && GetPublicOpeningsURL(orgId), SWRFetcher);

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
}
