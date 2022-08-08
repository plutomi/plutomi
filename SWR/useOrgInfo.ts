import useSWR from 'swr';
import { DEFAULTS, SWRFetcher } from '../Config';
import { GetOrgInfoURL } from '../adapters/Orgs';
import { DynamoOrg } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseOrgInfoProps {
  orgId?: string;
}

export const useOrgInfo = ({ orgId }: UseOrgInfoProps) => {
  const shouldFetch = orgId && orgId !== DEFAULTS.NO_ORG;
  const { data, error } = useSWR<DynamoOrg, APIErrorResponse>(
    shouldFetch && GetOrgInfoURL(),
    SWRFetcher,
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
};
