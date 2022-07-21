import { useRouter } from 'next/router';
import { Loader } from '../../components/Loader';
import { PublicOrgPageContent } from '../../components/PublicOrgPageContent';
import { PublicOrgPageHeader } from '../../components/PublicOrgPageHeader';
import { usePublicOrgById } from '../../SWR/usePublicOrgById';
import { CustomQuery } from '../../types/main';

export default function Apply() {
  const router = useRouter();
  const { orgId } = router.query as Pick<CustomQuery, 'orgId'>;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById({ orgId });

  if (isOrgError) return <h1>An error ocurred retrieving org info</h1>;
  if (isOrgLoading) return <Loader text="Loading..." />;

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
        <h1 className="text-2xl text-center font-bold">This org does not exist :(</h1>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 my-12 rounded-lg min-h-screen ">
      <header>
        <PublicOrgPageHeader />
      </header>

      <main className="mt-5">
        <PublicOrgPageContent />
      </main>
    </div>
  );
}
