import { useRouter } from 'next/router';
import { useAllPublicOpenings } from '../../SWR/useAllPublicOpenings';
import { CustomQuery } from '../../types/main';
import { Loader } from '../Loader';
import { PublicOpeningList } from '../PublicOpeningList';

export const PublicOrgPageContent = () => {
  const router = useRouter();
  const { orgId } = router.query as Pick<CustomQuery, 'orgId'>;
  const { publicOpenings, isPublicOpeningsLoading, isPublicOpeningsError } = useAllPublicOpenings({
    orgId,
  });

  if (isPublicOpeningsError) return <h1>An error ocurred retrieving openings for this org</h1>;

  if (isPublicOpeningsLoading) return <Loader text="Loading openings..." />;

  return (
    <div className="mt-6">
      {!publicOpenings.length ? (
        <h1 className="text-xl font-semibold">There aren&apos;t any openings right now :(</h1>
      ) : (
        <PublicOpeningList />
      )}
    </div>
  );
};
