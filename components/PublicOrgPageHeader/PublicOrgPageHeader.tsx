import { useRouter } from 'next/router';
import { usePublicOrgById } from '../../SWR/usePublicOrgById';
import { CustomQuery } from '../../types/main';

export const PublicOrgPageHeader = () => {
  const router = useRouter();
  const { orgId } = router.query as Pick<CustomQuery, 'orgId'>;
  const { org, isOrgLoading, isOrgError } = usePublicOrgById({ orgId });

  if (isOrgError) return <h1>An error ocurred retrieving org info</h1>;
  return (
    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-3xl font-extrabold leading-7 text-dark sm:truncate">
          {isOrgLoading ? 'Welcome!' : `Welcome to the ${org?.displayName} page `}
        </h2>
      </div>
    </div>
  );
};
