import { useRouter } from "next/router";
import useAllPublicOpenings from "../../../SWR/useAllPublicOpenings";
import SignIn from "../../../components/SignIn";
import axios from "axios";
import Loader from "../../../components/Loader";
import { mutate } from "swr";
import useOpeningById from "../../../SWR/useOpeningById";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import OpeningApplyPageContent from "../../../components/Openings/Public/OpeningApplyPageContent";
import OpeningApplyPageHeader from "../../../components/Openings/Public/OpeningApplyPageHeader";
export default function Apply() {
  const router = useRouter();
  const { org_id, opening_id } = router.query;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(org_id as string);

  if (isOrgLoading) {
    return <Loader text="Loading..." />;
  }

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <h1 className="text-2xl text-center font-bold">
          This org does not exist :(
        </h1>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      <header>
        <OpeningApplyPageHeader />
      </header>

      <main className="mt-5">
        <OpeningApplyPageContent />
      </main>
    </div>
  );
}
