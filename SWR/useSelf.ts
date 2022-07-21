import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetSelfInfoURL } from '../adapters/Users';
import { DynamoUser } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

export const useSelf = () => {
  const { data, error } = useSWR<DynamoUser, APIErrorResponse>(GetSelfInfoURL(), SWRFetcher, {
    shouldRetryOnError: false,
  });
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
};
