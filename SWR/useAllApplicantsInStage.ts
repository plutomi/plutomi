import axios from "axios";
import useSWR from "swr";
import StagesService from "../Adapters/StagesService";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllApplicantsInStage(
  opening_id: string,
  stage_id: string
): useAllApplicantsInStageOutput {
  const shouldFetch = opening_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch && StagesService.getAllApplicantsInStageURL({ stage_id }),
    fetcher
  );

  return {
    applicants: data,
    isApplicantsLoading: !error && !data,
    isApplicantsError: error,
  };
}

export default useAllApplicantsInStage;
