import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import Loader from "../../Loader";
export default function OpeningApplyPageHeader() {
  const router = useRouter();
  const { org_id, openingId } = router.query as CustomQuery;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id);
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    org_id,
    openingId
  );

  if (isOrgLoading) {
    return <Loader text={"Loading..."} />;
  }

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0 text-center space-y-2">
        <h2 className="text-3xl  font-extrabold leading-7 text-dark  sm:truncate">
          {org?.GSI1SK}
        </h2>
        <h2 className=" text-2xl font-semibold leading-7 text-light  sm:truncate">
          {isOpeningLoading ? null : `${opening?.GSI1SK}`}
        </h2>
      </div>
    </div>
  );
}
