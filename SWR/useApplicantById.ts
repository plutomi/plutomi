// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";
import ApplicantsService from "../adapters/ApplicantsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useApplicantById(applicant_id: string): useApplicantByIdOutput {
  // Despite removing the query string (applicant id) from the URl, this still runs before changing to null
  const shouldFetch =
    applicant_id && applicant_id !== "" && typeof applicant_id === "string"
      ? true
      : false;

  const { data, error } = useSWR(
    shouldFetch && ApplicantsService.getApplicantURL({ applicant_id }),
    fetcher
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}

export default useApplicantById;
