import { useRouter } from 'next/router';
import useAllPublicOpenings from '../../SWR/useAllPublicOpenings';
import { CustomQuery } from '../../types/main';
import { PublicOpeningList } from '../PublicOpeningList';

export const PublicOrgPageContent = () => {
  const router = useRouter();
  const { orgId } = router.query as Pick<CustomQuery, 'orgId'>;
  const { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } =
    useAllPublicOpenings(orgId);

  return (
    <div className="mt-6">
      {publicOpenings?.length === 0 ? (
        <h1 className="text-xl font-semibold">There aren&apos;t any openings right now :(</h1>
      ) : (
        <PublicOpeningList />
      )}
    </div>
  );
};
