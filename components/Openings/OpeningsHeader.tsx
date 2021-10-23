import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import { useState } from "react";
export default function OpeningsHeader() {
  const { user, isUserLoading, isUserError } = useSelf();
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const [localSearch, setLocalSearch] = useState("");
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );
  const setOpeningsSearch = useStore(
    (state: PlutomiState) => state.setOpeningsSearchInput
  );
  const search = useStore((state: PlutomiState) => state.openingsSearchInput);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    setOpeningsSearch(e.target.value);
  };
  return (
    <div className="md:flex md:items-center md:justify-between ">
      <div className=" min-w-0 ">
        <h2 className="text-2xl font-bold leading-7 text-dark sm:text-3xl sm:truncate">
          Openings
        </h2>
      </div>
      {openings?.length === 0 ? null : (
        <div className="flex-1 mt-4 flex md:mt-0  items-center  md:flex-grow justify-center">
          <input
            type="text"
            name="search"
            id="search"
            value={localSearch}
            onChange={(e) => handleSearchChange(e)}
            placeholder={"Search for an opening..."}
            className="w-1/2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block  border sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      )}

      {/* An empty state with an action button will show if the user doesn't have openings*/}
      {openings?.length > 0 && (
        <div className="mt-4 flex md:mt-0 md:ml-4 ">
          <button
            onClick={() =>
              setOpeningModal({
                is_modal_open: true,
                modal_mode: "CREATE",
                is_public: false,
                opening_id: "",
                GSI1SK: "",
              })
            }
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Opening
          </button>
        </div>
      )}
    </div>
  );
}
