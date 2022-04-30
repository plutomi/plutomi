import { useRouter } from 'next/router';
import useAllPublicOpenings from '../../../SWR/useAllPublicOpenings';
import { CUSTOM_QUERY } from '../../../types/main';
import PublicOpeningsList from '../../Openings/Public/PublicOpeningsList';
export default function OrgApplyPageContent() {
  const router = useRouter();
  const { orgId } = router.query as Pick<CUSTOM_QUERY, 'orgId'>;
  let { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(orgId);

  return (
    <div className="mt-6">
      {publicOpenings?.length === 0 ? (
        <h1 className="text-xl font-semibold">There aren&apos;t any openings right now :(</h1>
      ) : (
        <PublicOpeningsList />
      )}
    </div>
  );
}
