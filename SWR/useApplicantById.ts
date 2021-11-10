// Retrieves a specific opening by ID
import axios from "axios";
import useSWR from "swr";
import ApplicantsService from "../adapters/ApplicantsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useApplicantById(applicantId: string): useApplicantByIdOutput {
  // Despite removing the query string (applicant id) from the URl, this still runs before changing to null
  const shouldFetch =
    applicantId && applicantId !== "" && typeof applicantId === "string"
      ? true
      : false;

  const { data, error } = useSWR(
    shouldFetch && ApplicantsService.getApplicantURL({ applicantId }),
    fetcher
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}

export default useApplicantById;
