import useSWR from 'swr';
import { GetOpeningsInOrgURL } from '../adapters/Openings';
import { SWRFetcher } from '../Config';

export default function useOpenings() { // TODO rename to useOepningsInOrg
  const { data, error } = useSWR(GetOpeningsInOrgURL(), SWRFetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}
