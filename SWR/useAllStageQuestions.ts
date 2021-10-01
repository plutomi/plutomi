// Retrieves all questions for a stage
import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

/**
 *
 * @param org_id - The org in which the stage resides in
 * @param opening_id - The opening ID in which the stage resides in
 * @param stage_id - The stage ID
 *
 */
function useAllStageQuestions(
  org_id: string,
  opening_id: string,
  stage_id: string
): useAllStageQuestionsOutput {
  const shouldFetch = org_id && opening_id && stage_id ? true : false;

  const { data, error } = useSWR(
    shouldFetch &&
      `/api/orgs/${org_id}/public/openings/${opening_id}/stages/${stage_id}/questions`,
    fetcher
  );

  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}

export default useAllStageQuestions;
