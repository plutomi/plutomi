// Retrieves all questions for a stage
import axios from "axios";
import useSWR from "swr";
import QuestionsService from "../adapters/QuestionsService";
import StagesService from "../adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllStageQuestions(
  orgId: string,
  stage_id: string
): useAllStageQuestionsOutput {
  const shouldFetch = orgId && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getAllQuestionsInStageURL({ stage_id }),
    fetcher
  );

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}

export default useAllStageQuestions;
