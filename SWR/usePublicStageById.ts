// Retrieves a specific user by ID
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

// Returns very limited details an org's public opening
// User does not need to be signed in
function usePublicStageById(
  org_id: string,
  opening_id: string,
  stage_id: string
): useStageByIdOutput {
  const shouldFetch = org_id && opening_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      `/api/public/orgs/${org_id}/openings/${opening_id}/stages/${stage_id}`,
    fetcher
  );

  return {
    stage: data,
    isStageLoading: !error && !data,
    isStageError: error,
  };
}

export default usePublicStageById;
