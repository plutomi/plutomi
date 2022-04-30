import useSWR from 'swr';
import { GetQuestionsInStageURL } from '../adapters/Questions';
import { SWRFetcher } from '../Config';
export default function useQuestionsInStage({ openingId, stageId }) {
  const shouldFetch = openingId && stageId;
  const { data, error } = useSWR(
    shouldFetch && GetQuestionsInStageURL({ openingId, stageId }),
    SWRFetcher,
  );

  return {
    stageQuestions: data,
    isStageQuestionsLoading: !error && !data,
    isStageQuestionsError: error,
  };
}
