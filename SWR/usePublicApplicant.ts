import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetApplicantByIdURL } from '../adapters/Applicants';
import { DynamoApplicant } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UsePublicApplicantProps {
  applicantId?: string;
}
export const usePublicApplicant = ({ applicantId }: UsePublicApplicantProps) => {
  // TODO this needs updating due to login portal
  const { data, error } = useSWR<DynamoApplicant, APIErrorResponse>(
    applicantId && GetApplicantByIdURL(applicantId),
    SWRFetcher,
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
};
