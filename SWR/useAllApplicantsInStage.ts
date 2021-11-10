import axios from "axios";
import useSWR from "swr";
import StagesService from "../adapters/StagesService";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllApplicantsInStage(
  openingId: string,
  stage_id: string
): useAllApplicantsInStageOutput {
  const shouldFetch = openingId && stage_id ? true : false;
  const { data, error } = useSWR(
    // @ts-ignore TODO
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
