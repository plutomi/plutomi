import useApplicantById from "../../SWR/useApplicantById";
import { useRouter } from "next/router";
export default function ApplicationHeader() {
  const router = useRouter();
  const { applicant_id } = router.query;
  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById(
    applicant_id as string
  );
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Hello {applicant?.full_name}!
        </h2>
      </div>
    </div>
  );
}
