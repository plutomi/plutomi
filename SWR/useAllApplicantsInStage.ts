import useSWR from "swr";
import { GetAllApplicantsInStageURL } from "../adapters/Applicants";
import { SWRFetcher } from "../Config";
export default function useAllApplicantsInStage(
  openingId?: string,
  stageId?: string
) {
  const shouldFetch = openingId && stageId;
  const { data, error } = useSWR(
    shouldFetch && GetAllApplicantsInStageURL(openingId, stageId),
    SWRFetcher
  );

  return {
    applicants: data,
    isApplicantsLoading: !error && !data,
    isApplicantsError: error,
  };
}
