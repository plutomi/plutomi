import useSWR from "swr";
import { GetAllQuestionsInStageURL } from "../adapters/Stages";
import { SWRFetcher } from "../Config";
export default function useAllStageQuestions(
  openingId?: string,
  stageId?: string
) {
  const shouldFetch = openingId && stageId;

  const { data, error } = useSWR(
    shouldFetch && GetAllQuestionsInStageURL(openingId, stageId),
    SWRFetcher
  );

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}
