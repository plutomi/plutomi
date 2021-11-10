// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details an org's public opening
// User does not need to be signed in
function usePublicStageById( // TODO i think this can be refactored since we no longer need th eopening ID
  org_id: string,
  openingId: string,
  stage_id: string
): useStageByIdOutput {
  const shouldFetch = org_id && openingId && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      PublicInfoService.getPublicStageURL({ org_id, openingId, stage_id }),
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default usePublicStageById;
