import { useRouter } from "next/router";
import GoBack from "../../../components/Buttons/GoBackButton";
import Loader from "../../../components/Loader";
import usePublicOrgById from "../../../SWR/usePublicOrgById";
import usePublicOpeningById from "../../../SWR/usePublicOpeningById";
import OpeningApplyPageContent from "../../../components/Openings/Public/OpeningApplyPageContent";
import OpeningApplyPageHeader from "../../../components/Openings/Public/OpeningApplyPageHeader";
export default function Apply() {
  const router = useRouter();
  const { orgId, openingId }: Partial<CUSTOM_QUERY> = router.query;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(orgId);
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpeningById(
    orgId,
    openingId
  );

  if (isOrgLoading) {
    return <Loader text="Loading..." />;
  }

  if (isOpeningLoading) {
    <Loader text="Loading opening info..." />;
  }

  if (!opening) {
    return (
      <div className="mt-8 flex flex-col justify-center items-center mx-auto">
        <h1 className="text-2xl text-center font-bold">
          Unfortunately, you cannot apply to this opening.
        </h1>
        <GoBack url={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/${orgId}/apply`} />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      <div>
        <header>
          <OpeningApplyPageHeader />
        </header>

        <main className="">
          <OpeningApplyPageContent />
        </main>
      </div>
    </div>
  );
}
