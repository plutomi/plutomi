import useSWR from 'swr';
import { GetApplicantByIdURL } from '../adapters/Applicants';
import { SWRFetcher } from '../Config';
import { DynamoApplicant } from '../types/dynamo';
import { APIErrorResponse } from '../types/main';

interface UseApplicantByIdProps {
  applicantId?: string;
}

export const useApplicantById = ({ applicantId }: UseApplicantByIdProps) => {
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
