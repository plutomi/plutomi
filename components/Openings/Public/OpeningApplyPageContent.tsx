import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
import ApplicantInfoForm from "./ApplicantInfoForm";
import axios from "../axios";
import { CUSTOM_QUERY } from "../../../types/main";
export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "orgId"
  >;
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
