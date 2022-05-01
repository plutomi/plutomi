import useSWR from 'swr';
import { GetOpeningsInOrgURL } from '../adapters/Openings';
import { SWRFetcher } from '../Config';

export default function useOpenings() {
  const { data, error } = useSWR(GetOpeningsInOrgURL(), SWRFetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}
