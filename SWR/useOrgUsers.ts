import useSWR from 'swr';
import { GetUsersInOrgURL } from '../adapters/Users';
import { SWRFetcher } from '../Config';
import { DynamoUser } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseOrgUsersProps {
  orgId?: string;
}
export const useOrgUsers = ({ orgId }: UseOrgUsersProps) => {
  const { data, error } = useSWR<DynamoUser[], APIErrorResponse>(
    orgId && GetUsersInOrgURL(),
    SWRFetcher,
  );

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
};
