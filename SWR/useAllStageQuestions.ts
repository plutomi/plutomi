import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function useAllStageQuestions(org_id, opening_id, stage_id) {
  const shouldFetch = org_id && opening_id && stage_id ? true : false;
  console.log(`gettin questions`);
  console.log(
    `/api/orgs/${org_id}/openings/${opening_id}/stages/${stage_id}/questions`
  );

  const { data, error } = useSWR(
    shouldFetch
      ? `/api/orgs/${org_id}/openings/${opening_id}/stages/${stage_id}/questions`
      : null,
    fetcher
  );

  console.log(`qestions`, data);
  return {
    questions: data,
    isQuestionsLoading: !error && !data,
    isQuestionsError: error,
  };
}

export default useAllStageQuestions;
