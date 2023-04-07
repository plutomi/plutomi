import useSWR from 'swr';
import { GetQuestionsInStageURL } from '../.vscode/adapters/Questions';
import { SWRFetcher } from '../../Config';
import { DynamoQuestion } from '../@types/dynamo';
import { APIErrorResponse } from '../../@types/express';

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
