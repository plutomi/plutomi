import { useRouter } from 'next/router';
import Loader from '../../components/Loader';
import usePublicOrgById from '../../SWR/usePublicOrgById';
import OrgApplyPageHeader from '../../components/Orgs/Public/OrgApplyPageHeader';
import OrgApplyPageContent from '../../components/Orgs/Public/OrgApplyPageContent';
import { CUSTOM_QUERY } from '../../types/main';

export default function Apply() {
  const router = useRouter();
  const { orgId } = router.query as Pick<CUSTOM_QUERY, 'orgId'>;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById(orgId);

  if (isOrgLoading) {
    return <Loader text="Loading..." />;
  }

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
        <OrgApplyPageHeader />
      </header>

      <main className="mt-5">
        <OrgApplyPageContent />
      </main>
    </div>
  );
}
