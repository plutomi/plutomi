import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetPublicOrgInfoURL } from '../adapters/PublicInfo';
export default function usePublicOrgById(orgId?: string) {
  const { data, error } = useSWR(orgId && GetPublicOrgInfoURL(orgId), SWRFetcher);

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}
