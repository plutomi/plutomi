import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetSelfInfoURL } from '../adapters/Users';
import { APIErrorResponse } from '../types/main';
import { User } from '../entities';

export const useSelf = () => {
  const { data, error } = useSWR<User, APIErrorResponse>(GetSelfInfoURL(), SWRFetcher, {
    shouldRetryOnError: false,
  });
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
};
