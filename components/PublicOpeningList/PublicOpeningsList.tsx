import _ from 'lodash';
import { useRouter } from 'next/router';
import { useAllPublicOpenings } from '../../SWR/useAllPublicOpenings';
import { CustomQuery } from '../../types/main';
import { PublicOpeningListItem } from '../PublicOpeningListItem/PublicOpeningListItem';
import { DynamoOpening } from '../../types/dynamo';

export const PublicOpeningList = () => {
  const router = useRouter();
  const { orgId } = router.query as Pick<CustomQuery, 'orgId'>;
  const { publicOpenings } = useAllPublicOpenings({
    orgId,
  });

  // Loading & error state handled by parent
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {publicOpenings.map((opening: DynamoOpening) => (
          <PublicOpeningListItem opening={opening} />
        ))}
      </ul>
    </div>
  );
};
