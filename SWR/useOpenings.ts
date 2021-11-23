// Retrieves all openings in an org, public or private
import axios from "axios";
import useSWR from "swr";
import OpeningsService from "../Adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useOpenings(): useOpeningsOutput {
  const { data, error } = useSWR(OpeningsService.getAllOpeningsURL(), fetcher);

  return {
    openings: data,
    isOpeningsLoading: !error && !data,
    isOpeningsError: error,
  };
}

export default useOpenings;
