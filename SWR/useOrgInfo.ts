import useSWR from 'swr';
import { DEFAULTS, SWRFetcher } from '../Config';
import { GetOrgInfoURL } from '../adapters/Orgs';
import TagGenerator from '../utils/tagGenerator';

const bannedOrgValues = [DEFAULTS.NO_ORG, TagGenerator({ value: DEFAULTS.NO_ORG })];
export default function useOrgInfo(orgId?: string) {
  const shouldFetch = !bannedOrgValues.includes(orgId);

  const { data, error } = useSWR(shouldFetch && GetOrgInfoURL(), SWRFetcher);

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}
