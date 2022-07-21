import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetPublicOrgInfoURL } from '../adapters/PublicInfo';
import { DynamoOrg } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UsePublicOrgByIdProps {
  orgId?: string;
}

export const usePublicOrgById = ({ orgId }: UsePublicOrgByIdProps) => {
  // TODO public type! #702
  const { data, error } = useSWR<DynamoOrg, APIErrorResponse>(
    orgId && GetPublicOrgInfoURL(orgId),
    SWRFetcher,
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
};
