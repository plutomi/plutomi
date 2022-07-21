import useSWR, { Fetcher, Key } from 'swr';
import { GetApplicantsInStageURL } from '../adapters/Applicants';
import { API_URL, AXIOS_INSTANCE, SWRFetcher } from '../Config';
import { AllDynamoEntities, DynamoApplicant } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseAllApplicantsInStageProps {
  openingId?: string;
  stageId?: string;
}
export const useAllApplicantsInStage = ({ openingId, stageId }: UseAllApplicantsInStageProps) => {
  const shouldFetch = openingId && stageId;
  const { data, error } = useSWR<DynamoApplicant[], APIErrorResponse>(
    shouldFetch &&
      GetApplicantsInStageURL({
        openingId,
        stageId,
      }),
    SWRFetcher,
  );

  return {
    applicants: data,
    isApplicantsLoading: !error && !data,
    isApplicantsError: error,
  };
};
