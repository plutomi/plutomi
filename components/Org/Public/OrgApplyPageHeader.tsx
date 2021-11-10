import { useRouter } from "next/router";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
export default function OrgApplyPageHeader() {
  const router = useRouter();
  const { orgId } = router.query as CustomQuery;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(orgId);

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-extrabold leading-7 text-dark sm:truncate">
          {isOrgLoading ? "Welcome!" : `Welcome to the ${org?.GSI1SK} page `}
        </h2>
      </div>
    </div>
  );
}
