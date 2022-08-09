import useSWR from 'swr';
import { DEFAULTS, SWRFetcher } from '../Config';
import { GetOrgInfoURL } from '../adapters/Orgs';
import { APIErrorResponse } from '../types/main';
import { Schema } from 'mongoose';
import { IOrg } from '../entities/Org';

interface UseOrgInfoProps {
  orgId?: Schema.Types.ObjectId | DEFAULTS.NO_ORG;
}

export const useOrgInfo = ({ orgId }: UseOrgInfoProps) => {
  const shouldFetch = orgId && orgId !== DEFAULTS.NO_ORG;
  const { data, error } = useSWR<IOrg, APIErrorResponse>(
    shouldFetch && GetOrgInfoURL(),
    SWRFetcher,
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
};
