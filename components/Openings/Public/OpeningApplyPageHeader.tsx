import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
export default function OpeningApplyPageHeader() {
  const router = useRouter();
  const { org_id, opening_id } = router.query;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id as string);
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    org_id as string,
    opening_id as string
  );

  if (isOrgLoading) {
    return <Loader text={"Loading..."} />;
  }

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-extrabold leading-7 text-dark  sm:truncate">
          {org?.GSI1SK} {isOpeningLoading ? null : `- ${opening?.GSI1SK}`}
        </h2>
      </div>
    </div>
  );
}
