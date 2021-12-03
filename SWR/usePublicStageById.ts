// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";
import PublicInfoService from "../Adapters/PublicInfoService";
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details an org's public opening
// User does not need to be signed in
export default function usePublicStageById( // TODO i think this can be refactored since we no longer need th eopening ID
  orgId: string,
  openingId: string,
  stageId: string
) {
  const shouldFetch = orgId && openingId && stageId ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      PublicInfoService.getPublicStageURL(orgId, openingId, stageId),
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}
