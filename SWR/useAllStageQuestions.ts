// Retrieves all questions for a stage
import axios from "axios";
import useSWR from "swr";
import QuestionsService from "../adapters/QuestionsService";
import StagesService from "../adapters/StagesService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllStageQuestions(
  org_id: string,
  stageId: string
): useAllStageQuestionsOutput {
  const shouldFetch = org_id && stageId ? true : false;

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
