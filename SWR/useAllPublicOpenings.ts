// Retrieves all public openings at https://plutomi.com/`org-id`/apply
import axios from "../axios";
import useSWR from "swr";
import PublicInfoService from "../Adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useAllPublicOpenings(orgId: string) {
  const shouldFetch = orgId ? true : false;

  const { data, error } = useSWR(
    // @ts-ignore TODO
    shouldFetch && PublicInfoService.getAllPublicOpeningsURL(orgId),
    fetcher
  );

  return {
    publicOpenings: data,
    isPublicOpeningsLoading: !error && !data,
    isPublicOpeningsError: error,
  };
}
