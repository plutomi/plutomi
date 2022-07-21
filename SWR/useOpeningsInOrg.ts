import useSWR from 'swr';
import { GetOpeningsInOrgURL } from '../adapters/Openings';
import { SWRFetcher } from '../Config';
import { DynamoOpening } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

export const useOpeningsInOrg = () => {
  const { data, error } = useSWR<DynamoOpening[], APIErrorResponse>(
    GetOpeningsInOrgURL(),
    SWRFetcher,
  );

  return {
    openingsInOrg: data,
    isOpeningsInOrgLoading: !error && !data,
    isOpeningsInOrgError: error,
  };
};
