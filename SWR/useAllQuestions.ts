import useSWR from "swr";
import { GetQuestionsInOrgURL } from "../adapters/Questions";
import { SWRFetcher } from "../Config";
export default function useAllQuestions() {
  const { data, error } = useSWR(GetQuestionsInOrgURL(), SWRFetcher);

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}
