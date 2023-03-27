import useSWR from 'swr';
import { SWRFetcher } from '../../Config';
import { GetOrgInfoURL } from '../.vscode/adapters/Orgs';
import { APIErrorResponse } from '../../@types/express';
import { Org } from '../entities';

interface UseOrgInfoProps {
  orgId?: string;
}

export const useOrgInfo = ({ orgId }: UseOrgInfoProps) => {
  const { data, error } = useSWR<Org, APIErrorResponse>(orgId && GetOrgInfoURL(), SWRFetcher);

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
};