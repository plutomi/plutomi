import axios from "../axios";
import useSWR from "swr";
import ApplicantsService from "../Adapters/ApplicantsService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function useApplicantById(applicantId: string) {
  // Despite removing the query string (applicant id) from the URl, this still runs before changing to null
  const shouldFetch =
    applicantId && applicantId !== "" && typeof applicantId === "string"
      ? true
      : false;

  const { data, error } = useSWR(
    shouldFetch && ApplicantsService.getApplicantURL(applicantId),
    fetcher
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}
