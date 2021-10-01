import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
import ApplicantInfoForm from "./ApplicantInfoForm";
export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { org_id, opening_id } = router.query;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id as string);
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    org_id as string,
    opening_id as string
  );

  if (isOpeningLoading) {
    return <Loader text={"Loading..."} />;
  }

  const applyForOpening = async () => {
    alert("Applied");
  };
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
        Opening details will go here
      </h2>
      <div className="p-10">
        <ApplicantInfoForm applyForOpening={applyForOpening} />
      </div>
    </div>
  );
}
