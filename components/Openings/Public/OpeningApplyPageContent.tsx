import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
import ApplicantInfoForm from "./ApplicantInfoForm";
import axios from "axios";
export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { org_id, opening_id } = router.query as CustomQuery;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    org_id,
    opening_id
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
