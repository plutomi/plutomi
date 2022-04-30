import useSWR from 'swr';
import { SWRFetcher } from '../Config';
import { GetApplicantByIdURL } from '../adapters/Applicants';
export default function usePublicApplicant(applicantId?: string) {
  // TODO this needs updating due to login portal
  const { data, error } = useSWR(applicantId && GetApplicantByIdURL(applicantId), SWRFetcher);

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}
