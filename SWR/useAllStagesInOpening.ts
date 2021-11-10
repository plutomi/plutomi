// Retrieves all stages in an opening
import axios from "axios";
import useSWR from "swr";
import StagesService from "../adapters/StagesService";
import OpeningsService from "../adapters/OpeningsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllStagesInOpening(openingId: string): useAllStagesInOpeningOutput {
  const shouldFetch = openingId ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      OpeningsService.getAllStagesInOpeningURL({
        openingId: openingId,
      }),
    fetcher
  );

  return {
    stages: data,
    isStagesLoading: !error && !data,
    isStagesError: error,
  };
}

export default useAllStagesInOpening;
