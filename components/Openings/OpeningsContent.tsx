import { mutate } from "swr";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import { useState } from "react";
import OpeningsService from "../../adapters/OpeningsService";
import OpeningList from "./OpeningsList";
import { PlusIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import EmptyOpeningsState from "./EmptyOpeningsState";
import OpeningModal from "./OpeningModal";
import useOpenings from "../../SWR/useOpenings";
export default function OpeningsContent() {
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings();
  const openingModal = useStore((state) => state.openingModal);
  const setOpeningModal = useStore((state) => state.setOpeningModal);

  const [localSearch, setLocalSearch] = useState("");

  const setOpeningsSearch = useStore((state) => state.setOpeningsSearchInput);
  const search = useStore((state) => state.openingsSearchInput);

  if (isOpeningsLoading) {
    return <Loader text="Loading openings..." />;
  }

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    setOpeningsSearch(e.target.value);
  };

  const createOpening = async () => {
    try {
      const { message } = await OpeningsService.createOpening(
        openingModal.GSI1SK
      );

      alert(message);

      setOpeningModal({
        isModalOpen: false,
        modalMode: "CREATE",
        isPublic: false,
        openingId: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    mutate(OpeningsService.getAllOpeningsURL()); // Get all openings
  };

  return (
    <>
      <OpeningModal createOpening={createOpening} />

      {openings.length === 0 ? (
        <EmptyOpeningsState />
      ) : (
        <div className="flex-1 my-4 flex md:mt-0  items-center  md:flex-grow justify-center">
          <input
            type="text"
            name="search"
            id="search"
            value={localSearch}
            onChange={(e) => handleSearchChange(e)}
            placeholder={"Search for an opening..."}
            className="w-1/2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block  border sm:text-sm border-gray-300 rounded-md"
          />
          <button
            onClick={() =>
              setOpeningModal({
                isModalOpen: true,
                modalMode: "CREATE",
                isPublic: false,
                openingId: "",
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

      <OpeningList />
    </>
  );
}
