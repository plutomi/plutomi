import { Opening } from '../../entities';
import { useOpeningsInOrg } from '../../SWR/useOpeningsInOrg';
import { useSelf } from '../../SWR/useSelf';
import useStore from '../../utils/store';
import { Loader } from '../Loader/Loader';
import { OpeningsListItem } from '../OpeningsListItem';

export const OpeningsList = () => {
  const { openingsInOrg, isOpeningsInOrgLoading, isOpeningsInOrgError } = useOpeningsInOrg();

  const search = useStore((state) => state.openingsSearchInput);

  const filteredOpenings = openingsInOrg?.filter((opening: Opening) =>
    opening.name.toLowerCase().trim().includes(search.toLowerCase().trim()),
  );

  if (isOpeningsInOrgError) return <h1>An error ocurred returning openings in the org</h1>;
  if (isOpeningsInOrgLoading) return <Loader text="Loading openings..." />;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {filteredOpenings?.map((opening) => (
          <OpeningsListItem opening={opening} />
        ))}
      </ul>
    </div>
  );
};
