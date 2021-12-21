import axios from "../utils/axios";
import useSWR from "swr";
import OrgsService from "../adapters/OrgsService";
import { DEFAULTS } from "../Config";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function usePrivateOrgById(orgId: string) {
  const shouldFetch = orgId !== DEFAULTS.NO_ORG ? true : false;

  // TODO make sure this org ID is being passed by the user
  const { data, error } = useSWR(
    shouldFetch && OrgsService.getOrgURL(orgId),
    fetcher
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}
