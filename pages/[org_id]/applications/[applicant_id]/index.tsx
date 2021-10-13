
import ApplicationContent from "../../../../components/Applicants/ApplicationContent";
import { mutate } from "swr";
import useStore from "../../../../utils/store";
import CreateOrgModal from "../../../../components/CreateOrgModal";
import EmptyOrgState from "../../../../components/Dashboard/EmptyOrgState";
import Loader from "../../../../components/Loader";
import useApplicantById from "../../../../SWR/useApplicantById";
import { useRouter } from "next/router";
import ApplicationHeader from "../../../../components/Applicants/ApplicationHeader";
export default function Application() {
  const router = useRouter();
  const { applicant_id } = router.query;
  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById(
    applicant_id as string
  );
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined") {
    <Loader text="Loading ..." />;
  }

  if (isApplicantLoading) {
    return <Loader text="Loading info..." />;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <header>
          <ApplicationHeader />
        </header>

        <main className="mt-5">
          <ApplicationContent />
        </main>
      </div>
    </>
  );
}
