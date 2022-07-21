import useSWR from 'swr';
import { GetQuestionsInOrgURL } from '../adapters/Questions';
import { SWRFetcher } from '../Config';
import { DynamoQuestion } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

export const useQuestionsInOrg = () => {
  const { data, error } = useSWR<DynamoQuestion[], APIErrorResponse>(
    GetQuestionsInOrgURL(),
    SWRFetcher,
  );

  return {
    orgQuestions: data,
    isOrgQuestionsLoading: !error && !data,
    isOrgQuestionsError: error,
  };
};
