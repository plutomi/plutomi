import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
import ApplicantInfoForm from "./ApplicantInfoForm";
import axios from "axios";
export default function OpeningApplyPageContent() {
  const router = useRouter();
  const { org_id, opening_id } = router.query;
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    org_id as string,
    opening_id as string
  );

  if (isOpeningLoading) {
    return <Loader text={"Loading..."} />;
  }

  const applyForOpening = async (body: APICreateApplicantInput) => {
    try {
      const { data } = await axios.post(
        `/api/orgs/${org_id}/public/openings/${opening_id}/applicants`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }
  };
  return (
    <div className="">
      <ApplicantInfoForm applyForOpening={applyForOpening} />
    </div>
  );
}
