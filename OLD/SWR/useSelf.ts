import useSWR from 'swr';
import { SWRFetcher } from '../../Config';
import { GetSelfInfoURL } from '../.vscode/adapters/Users';
import { UserEntity } from '../models';
import { APIErrorResponse } from '../../@types/apiErrorResponse';

export const useSelf = () => {
  const { data, error } = useSWR<UserEntity, APIErrorResponse>(GetSelfInfoURL(), SWRFetcher, {
    shouldRetryOnError: false,
  });
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
};
