import { useRouter } from "next/router";
import useAllPublicOpenings from "../../../SWR/useAllPublicOpenings";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
export default function OrgApplyPageHeader() {
  const router = useRouter();
  const { org_id } = router.query;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id as string);

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          {isOrgLoading ? "Welcome!" : `Welcome to the ${org?.GSI1SK} page `}
        </h2>
      </div>
    </div>
  );
}
