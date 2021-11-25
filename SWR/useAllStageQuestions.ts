import axios from "axios";
import useSWR from "swr";
import StagesService from "../Adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useAllStageQuestions(orgId: string, stageId: string) {
  const shouldFetch = orgId && stageId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getAllQuestionsInStageURL(stageId),
    fetcher
  );

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}
