import useOpenings from '../../SWR/useOpenings';
import useSelf from '../../SWR/useSelf';
import { DynamoOpening } from '../../types/dynamo';
import useStore from '../../utils/store';
import { Loader } from '../Loader/Loader';
import { OpeningsListItem } from '../OpeningsListItem';

export const OpeningsList = () => {
  const { user, isUserLoading, isUserError } = useSelf();
  const { openings, isOpeningsLoading, isOpeningsError } = useOpenings();

  const search = useStore((state) => state.openingsSearchInput);

  const filteredOpenings = openings?.filter((opening: DynamoOpening) =>
    opening?.openingName?.toLowerCase().trim().includes(search.toLowerCase().trim()),
  );

  if (isOpeningsLoading) return <Loader text="Loading openings..." />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {filteredOpenings?.map((opening) => (
          <OpeningsListItem opening={opening} user={user} />
        ))}
      </ul>
    </div>
  );
};
