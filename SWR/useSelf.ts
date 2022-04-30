import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetSelfInfoURL } from '../adapters/Users';
export default function useSelf() {
  const { data, error } = useSWR(GetSelfInfoURL(), SWRFetcher, {
    shouldRetryOnError: false,
  });
  return {
    user: data,
    isUserLoading: !error && !data,
    isUserError: error,
  };
}
