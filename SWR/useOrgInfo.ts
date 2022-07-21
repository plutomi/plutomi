import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetOrgInfoURL } from '../adapters/Orgs';
import { DynamoOrg } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseOrgInfoProps {
  orgId?: string;
}

export const useOrgInfo = ({ orgId }: UseOrgInfoProps) => {
  const { data, error } = useSWR<DynamoOrg, APIErrorResponse>(orgId && GetOrgInfoURL(), SWRFetcher);

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
};
