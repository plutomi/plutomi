import useSWR from 'swr';
import { GetUsersInOrgURL } from '../adapters/Users';
import { SWRFetcher } from '../Config';

interface UseOrgUsersProps {
  orgId: string;
}
export const useOrgUsers = ({ orgId }: UseOrgUsersProps) => {
  const { data, error } = useSWR(orgId && GetUsersInOrgURL(), SWRFetcher);

  return {
    orgUsers: data,
    isOrgUsersLoading: !error && !data,
    isOrgUsersError: error,
  };
};
