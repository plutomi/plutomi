import axios from "../utils/axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function usePublicApplicant(applicantId: string) {
  // Despite removing the query string (applicant id) from the URl, this still runs before changing to null // TODO revisit
  const shouldFetch =
    applicantId && applicantId !== "" && typeof applicantId === "string"
      ? true
      : false;

  const { data, error } = useSWR(
    shouldFetch && PublicInfoService.getPublicApplicantURL(applicantId),
    fetcher
  );

  return {
    applicant: data,
    isApplicantLoading: !error && !data,
    isApplicantError: error,
  };
}
