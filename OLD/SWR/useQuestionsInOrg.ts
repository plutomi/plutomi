import useSWR from 'swr';
import { APIErrorResponse } from '../../@types/apiErrorResponse';
import { GetQuestionsInOrgURL } from '../.vscode/adapters/Questions';
import { SWRFetcher } from '../../Config';
import { QuestionEntity } from '../models';

export const useQuestionsInOrg = () => {
  const { data, error } = useSWR<QuestionEntity[], APIErrorResponse>(
    GetQuestionsInOrgURL(),
    SWRFetcher,
  );

  return {
    orgQuestions: data,
    isOrgQuestionsLoading: !error && !data,
    isOrgQuestionsError: error,
  };
};
