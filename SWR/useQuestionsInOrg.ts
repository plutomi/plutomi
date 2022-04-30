import useSWR from 'swr';
import { GetQuestionsInOrgURL } from '../adapters/Questions';
import { SWRFetcher } from '../Config';
export default function useQuestionsInOrg() {
  const { data, error } = useSWR(GetQuestionsInOrgURL(), SWRFetcher);

  return {
    orgQuestions: data,
    isOrgQuestionsLoading: !error && !data,
    isOrgQuestionsError: error,
  };
}
