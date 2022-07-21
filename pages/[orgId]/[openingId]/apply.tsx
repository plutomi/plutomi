import { useRouter } from 'next/router';
import { usePublicOrgById } from '../../../SWR/usePublicOrgById';
import { usePublicOpening } from '../../../SWR/usePublicOpening';
import { CustomQuery } from '../../../types/main';
import { WEBSITE_URL } from '../../../Config';
import { Loader } from '../../../components/Loader';
import { PublicOpeningPageHeader } from '../../../components/PublicOpeningPageHeader';
import { PublicOpeningPageContent } from '../../../components/PublicOpeningPageContent';
import { GoBackButton } from '../../../components/GoBackButton';

export default function Apply() {
  const router = useRouter();
  const { orgId, openingId } = router.query as Pick<CustomQuery, 'openingId' | 'orgId'>;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById({ orgId });
  const { opening, isOpeningLoading, isOpeningError } = usePublicOpening({ orgId, openingId });

  if (isOrgError || isOpeningError) return <h1>An error ocurred retrieving org data</h1>;
  if (isOrgLoading) return <Loader text="Loading..." />;
  if (isOpeningLoading) return <Loader text="Loading opening info..." />;

  if (!opening) {
    return (
      <div className="mt-8 flex flex-col justify-center items-center mx-auto">
        <h1 className="text-2xl text-center font-bold">
          Unfortunately, you cannot apply to this opening.
        </h1>
        <GoBackButton url={`${WEBSITE_URL}/${orgId}/apply`} />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      <div>
        <header>
          <PublicOpeningPageHeader />
        </header>

        <main>
          <PublicOpeningPageContent />
        </main>
      </div>
    </div>
  );
}
