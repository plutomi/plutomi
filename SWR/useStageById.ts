import axios from "axios";
import useSWR from "swr";
import StagesService from "../Adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useStageById(stageId: string) {
  const shouldFetch = stageId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getStageURL(stageId),
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}
