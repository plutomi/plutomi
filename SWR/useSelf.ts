import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetSelfInfoURL } from '../adapters/Users';
import { APIErrorResponse } from '../types/main';
import { IUser } from '../entities/User';

export const useSelf = () => {
  const { data, error } = useSWR<IUser, APIErrorResponse>(GetSelfInfoURL(), SWRFetcher, {
    shouldRetryOnError: false,
  });
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
};
