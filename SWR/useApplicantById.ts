// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useApplicantById(applicant_id: string): useApplicantByIdOutput {
  const shouldFetch = applicant_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && `/api/applicants/${applicant_id}`,
    fetcher
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}

export default useApplicantById;
