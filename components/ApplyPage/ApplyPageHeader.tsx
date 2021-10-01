import { useRouter } from "next/router";
import useAllPublicOpenings from "../../SWR/useAllPublicOpenings";
export default function DashboardHeader() {
  const router = useRouter();
  const { org_id } = router.query;
  const { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(org_id as string);

  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
         {isPublicOpeningsLoading ? "Loading..." : `Welcome to the `}
        </h2>
      </div>
    </div>
  );
}
