import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
import ApplicantInfoForm from "./ApplicantInfoForm";
import axios from "axios";
export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { orgId, openingId } = router.query as CustomQuery;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    orgId,
    openingId
  );

  if (isOpeningLoading) {
    return <Loader text={"Loading..."} />;
  }

  return (
    <div className="">
      <ApplicantInfoForm />
    </div>
  );
}
