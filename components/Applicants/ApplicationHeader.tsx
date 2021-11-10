import useApplicantById from "../../SWR/useApplicantById";
import { useRouter } from "next/router";
import useStageById from "../../SWR/useStageById";
export default function ApplicationHeader() {
  const router = useRouter();
  const { applicant_id } = router.query as CustomQuery;
  const { applicant, isApplicantLoading, isApplicantError } =
    useApplicantById(applicant_id);

  const { stage, isStageLoading, isStageError } = useStageById(
    applicant?.current_stageId
  );
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Hello {applicant?.full_name}!
        </h2>
        <h2 className="text-lg mt-6 leading-7 text-normal sm:text-3xl sm:truncate">
          {stage?.GSI1SK}
        </h2>
      </div>
    </div>
  );
}
