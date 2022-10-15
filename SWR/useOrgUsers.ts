import useSWR from 'swr';
import { GetUsersInOrgURL } from '../adapters/Users';
import { SWRFetcher } from '../Config';
import { User } from '../entities';
import { APIErrorResponse } from '../types/main';

interface UseOrgUsersProps {
  orgId?: string;
}
export const useOrgUsers = ({ orgId }: UseOrgUsersProps) => {
  const { data, error } = useSWR<User[], APIErrorResponse>(orgId && GetUsersInOrgURL(), SWRFetcher);

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
};
