import useApplicantById from "../../SWR/useApplicantById";
import { useRouter } from "next/router";
import useStageById from "../../SWR/useStageById";
import { CUSTOM_QUERY } from "../../types/main";
export default function ApplicationHeader() {
  const router = useRouter();
  const { applicantId }: Partial<CUSTOM_QUERY> = router.query;
  const { applicant, isApplicantLoading, isApplicantError } =
    useApplicantById(applicantId);

  const { stage, isStageLoading, isStageError } = useStageById(
    applicant?.stageId
  );
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Hello {applicant?.fullName}!
        </h2>
        <h2 className="text-lg mt-6 leading-7 text-normal sm:text-3xl sm:truncate">
          {stage?.GSI1SK}
        </h2>
      </div>
    </div>
  );
}
