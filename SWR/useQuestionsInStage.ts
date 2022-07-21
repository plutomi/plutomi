import useSWR from 'swr';
import { GetQuestionsInStageURL } from '../adapters/Questions';
import { SWRFetcher } from '../Config';
import { DynamoQuestion } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseQuestionsInStageProps {
  openingId?: string;
  stageId?: string;
}

export const useQuestionsInStage = ({ openingId, stageId }: UseQuestionsInStageProps) => {
  const shouldFetch = openingId && stageId;
  const { data, error } = useSWR<DynamoQuestion[], APIErrorResponse>(
    shouldFetch && GetQuestionsInStageURL({ openingId, stageId }),
    SWRFetcher,
  );

  return {
    stageQuestions: data,
    isStageQuestionsLoading: !error && !data,
    isStageQuestionsError: error,
  };
};
