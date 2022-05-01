import useSWR from 'swr';
import { GetApplicantByIdURL } from '../adapters/Applicants';
import { SWRFetcher } from '../Config';

export default function useApplicantById(applicantId?: string) {
  const { data, error } = useSWR(applicantId && GetApplicantByIdURL(applicantId), SWRFetcher);

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}
