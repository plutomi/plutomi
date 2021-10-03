// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param user_id - The ID of the logged in user
 * @param opening_id - The opening ID that you want to look up
 */
function useOpeningById(applicant_id: string): useApplicantByIdOutput {
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

export default useOpeningById;
