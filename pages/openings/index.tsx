import useOpenings from "../../SWR/useOpenings";
import useSelf from "../../SWR/useSelf";
import { mutate } from "swr";
import useStore from "../../utils/store";
import CreateOpeningModal from "../../components/Openings/OpeningModal";
import EmptyOpeningsState from "../../components/Openings/EmptyOpeningsState";
import OpeningsService from "../../adapters/OpeningsService";
import NewPage from "../../components/Templates/NewPage";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/outline";
import OpeningList from "../../components/Openings/OpeningsList";
export default function Openings() {
  const { user, isUserLoading, isUserError } = useSelf();
  let { openings, isOpeningsLoading, isOpeningsError } = useOpenings(
    user?.user_id
  );

  const openingModal = useStore((state: PlutomiState) => state.openingModal);
  const setOpeningModal = useStore(
    (state: PlutomiState) => state.setOpeningModal
  );

  const [localSearch, setLocalSearch] = useState("");

  const setOpeningsSearch = useStore(
    (state: PlutomiState) => state.setOpeningsSearchInput
  );
  const search = useStore((state: PlutomiState) => state.openingsSearchInput);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    setOpeningsSearch(e.target.value);
  };

  const createOpening = async () => {
    try {
      const { message } = await OpeningsService.createOpening({
        GSI1SK: openingModal.GSI1SK,
      });

      alert(message);

      setOpeningModal({
        is_modal_open: false,
        modal_mode: "CREATE",
        is_public: false,
        opening_id: "",
        GSI1SK: "",
      });
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }

    console.log("Getting alll openings");
    mutate(OpeningsService.getAllOpeningsURL()); // Get all openings
  };

  return (
    <NewPage
      loggedOutPageText={"Log in to view your openings"}
      currentNavbarItem={"Openings"}
      headerText={"Openings"}
    >
      <>
        <CreateOpeningModal createOpening={createOpening} />
        {openings?.length == 0 ? (
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

        {/* An empty state with an action button will show if the user doesn't have openings*/}

        <OpeningList />
      </>
    </NewPage>
  );
}
