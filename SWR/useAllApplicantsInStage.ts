// Retrieves all applicants in a stage
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllApplicantsInStage(
  opening_id: string,
  stage_id: string
): useAllApplicantsInStageOutput {
  const shouldFetch = opening_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && `/api/openings/${opening_id}/stages/${stage_id}/applicants`,
    fetcher
  );

  return {
    applicants: data,
    isApplicantsLoading: !error && !data,
    isApplicantsError: error,
  };
}

export default useAllApplicantsInStage;
