import useSWR from 'swr';
import { GetOpeningsInOrgURL } from '../.vscode/adapters/Openings';
import { SWRFetcher } from '../../Config';
import { Opening } from '../entities';
import { APIErrorResponse } from '../../@types/express';

export const useOpeningsInOrg = () => {
  const { data, error } = useSWR<Opening[], APIErrorResponse>(GetOpeningsInOrgURL(), SWRFetcher);

  return {
    openingsInOrg: data,
    isOpeningsInOrgLoading: !error && !data,
    isOpeningsInOrgError: error,
  };
};
