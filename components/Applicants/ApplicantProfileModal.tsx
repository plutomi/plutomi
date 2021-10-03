/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
import useApplicantById from "../../SWR/useApplicantById";
const tabs = [
  { id: 1, name: "Details" },
  { id: 2, name: "History" }, // TODO add get history SWR
  { id: 3, name: "Messages" }, // TODO add get messages (Twilio)
];

const team = [
  {
    name: "Leslie Alexander",
    handle: "lesliealexander",
    href: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    status: "online",
  },
  // More people...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ApplicantProfileModal() {
  const [currentActive, setCurrentActive] = useState(1); // Id of item
  const router = useRouter();

  const setApplicantProfileModal = useStore(
    (store: PlutomiState) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store: PlutomiState) => store.applicantProfileModal
  );

  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById(
    applicantProfileModal.applicant_id
  );

  const handleNavClick = (e, tabId: number) => {
    e.preventDefault();
    setCurrentActive(tabId);
  };
  return (
    <Transition.Root show={applicantProfileModal.is_modal_open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden "
        onClose={() =>
          setApplicantProfileModal({
            ...applicantProfileModal,
            is_modal_open: false,
          })
        }
      >
        <div className="absolute inset-0 overflow-hidden ">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom=" translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom=" translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-3xl">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {isApplicantLoading
                          ? "Loading..."
                          : applicant.full_name}
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500"
                          onClick={() =>
                            setApplicantProfileModal({
                              ...applicantProfileModal,
                              is_modal_open: false,
                            })
                          }
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="text-md text-light mt-1">
                      {isApplicantLoading ? "Loading..." : applicant.email}
                    </p>
                  </div>
                  <div className="border-b border-gray-200  ">
                    <div className="px-6">
                      <nav
                        className="-mb-px flex justify-around "
                        x-descriptions="Tab component"
                      >
                        {tabs.map((tab) => (
                          <a
                            onClick={(e) => handleNavClick(e, tab.id)}
                            key={tab.name}
                            href={null}
                            className={classNames(
                              tab.id == currentActive
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-normal hover:text-dark hover:border-blue-gray-300 transition ease-in-out duration-200",
                              "cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>

                  <div className="p-4">
                    {currentActive == 1 ? (
                      <h1>Viewing details</h1>
                    ) : currentActive == 2 ? (
                      <h1>Viewing History</h1>
                    ) : currentActive == 3 ? (
                      <h1>Viewing messages</h1>
                    ) : (
                      <h1>Invalid nav index</h1>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
