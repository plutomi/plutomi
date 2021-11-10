// Retrieves all questions for a stage
import axios from "axios";
import useSWR from "swr";
import QuestionsService from "../adapters/QuestionsService";
import StagesService from "../adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllStageQuestions(
  orgId: string,
  stageId: string
): useAllStageQuestionsOutput {
  const shouldFetch = orgId && stageId ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getAllQuestionsInStageURL({ stageId }),
    fetcher
  );

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}

export default useAllStageQuestions;
