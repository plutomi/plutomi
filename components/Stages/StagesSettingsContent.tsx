import { useRouter } from "next/router";
import StageReorderColumn from "../StageReorderColumn";
import useAllQuestions from "../../SWR/useAllQuestions";
import Loader from "../Loader";
import useSelf from "../../SWR/useSelf";
import useAllStagesInOpening from "../../SWR/useAllStagesInOpening";
import useOpeningInfo from "../../SWR/useOpeningInfo";
import useStageInfo from "../../SWR/useStageInfo";
import { CUSTOM_QUERY } from "../../types/main";
import { useEffect, useState, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const tabs = [
  { id: 1, name: "Questions" },
  { id: 2, name: "Rules (TODO)?" },
  // { id: 3, name: "Messages" }, // TODO add get messages (Twilio)
];

const people = [
  { id: 1, name: "Wade Cooper" },
  { id: 2, name: "Arlene Mccoy" },
  { id: 3, name: "Devon Webb" },
  { id: 4, name: "Tom Cook" },
  { id: 5, name: "Tanya Fox" },
  { id: 6, name: "Hellen Schmidt" },
  { id: 7, name: "Caroline Schultz" },
  { id: 8, name: "Mason Heaney" },
  { id: 9, name: "Claudie Smitham" },
  { id: 10, name: "Emil Schaefer" },
];

export default function StageSettingsContent() {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState("");
  const [currentActive, setCurrentActive] = useState(1); // Id of item
  const { allQuestions, isAllQuestionsLoading, isAllQuestionsError } =
    useAllQuestions();
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const { openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId"
  >;

  function Search() {
    return (
      <input
        type="text"
        name="search"
        id="search"
        value={localSearch}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder={"Search for a question to add to this stage..."}
        className=" shadow-sm focus:ring-blue-500 focus:border-blue-500   border sm:text-sm border-gray-300 rounded-md"
      />
    );
  }

  const handleSearch = async () => {
    // TODO get all questions based on current localSearch text
    console.log(localSearch);
  };

  useEffect(() => {
    handleSearch();
  }, [localSearch]);

  const { user, isUserLoading, isUserError } = useSelf();
  let { opening, isOpeningLoading, isOpeningError } = useOpeningInfo(openingId);

  let { stages, isStagesLoading, isStagesError } = useAllStagesInOpening(
    opening?.openingId
  );
  const { stage, isStageLoading, isStageError } = useStageInfo(
    openingId,
    stageId
  );

  if (isOpeningLoading) {
    return <Loader text="Loading opening..." />;
  }

  if (isStagesLoading) {
    // TODO i think here we should render the column
    return <Loader text="Loading stages..." />;
  }

  return (
    <>
      {/* 3 column wrapper */}
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 min-w-0 bg-white xl:flex">
          <div className="border-b border-gray-200 xl:border-b-0 xl:flex-shrink-0 xl:w-64 xl:border-r xl:border-gray-200 bg-white">
            <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
              {/* Start left column area */}
              <StageReorderColumn />
              {/* End left column area */}
            </div>
          </div>

          <div className="bg-white lg:min-w-0 lg:flex-1">
            <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
              {/* Start main area*/}
              <div className="relative h-full" style={{ minHeight: "36rem" }}>
                <div className=" inset-0  border-gray-200 rounded-lg">
                  <div className="flex flex-col justify-center items-center">
                    <nav
                      className="-mb-px flex w-full "
                      x-descriptions="Tab component"
                    >
                      {tabs.map((tab) => (
                        // TODO this is a mess
                        <button
                          onClick={() => setCurrentActive(tab.id)}
                          key={tab.name}
                          className={classNames(
                            tab.id === currentActive
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-normal hover:text-dark hover:border-blue-gray-300 transition ease-in-out duration-200",
                            "text-center w-full cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg"
                          )}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </nav>

                    <div className="w-full mt-4 mx-auto border ">
                      <Listbox value={selected} onChange={setSelected}>
                        <>
                          <Listbox.Button as={Search} />
                          <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              {people.map((person) => (
                                <Listbox.Option
                                  key={person.id}
                                  className={({ active }) =>
                                    classNames(
                                      active
                                        ? "text-white bg-indigo-600"
                                        : "text-gray-900",
                                      "cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-red-400"
                                    )
                                  }
                                  value={person}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={classNames(
                                          selected
                                            ? "font-semibold"
                                            : "font-normal",
                                          "block truncate"
                                        )}
                                      >
                                        {person.name}
                                      </span>

                                      {selected ? (
                                        <span
                                          className={classNames(
                                            active
                                              ? "text-white"
                                              : "text-indigo-600",
                                            "absolute inset-y-0 right-0 flex items-center pr-4"
                                          )}
                                        >
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </Transition>
                        </>
                      </Listbox>
                    </div>

                    <p>Open state: {open.toString()}</p>
                    <p>
                      QUESTIONS:
                      {JSON.stringify(allQuestions)}
                    </p>
                  </div>
                </div>
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
