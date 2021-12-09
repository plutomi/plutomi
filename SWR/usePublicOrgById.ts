import axios from "../axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function usePublicOrgById(orgId: string) {
  const shouldFetch = orgId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicOrgURL(orgId),
    fetcher
  );

  return {
    org: data,
    isOrgLoading: !error && !data,
    isOrgError: error,
  };
}
