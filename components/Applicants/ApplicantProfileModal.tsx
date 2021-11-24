import { Fragment, useState } from "react";
import EasyEdit, { Types } from "react-easy-edit";
import CustomEditableInput from "./CustomEditableInput";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, ChevronDoubleRightIcon } from "@heroicons/react/outline";
import CustomEditableAction from "./CustomEditableSave";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
import { mutate } from "swr";
import ClickToCopy from "../ClickToCopy";
import delay from "delay";
import useApplicantById from "../../SWR/useApplicantById";
import ApplicantsService from "../../Adapters/ApplicantsService";
import { CUSTOM_QUERY } from "../../types/main";
const tabs = [
  { id: 1, name: "Details" },
  { id: 2, name: "History (todo)" },
  // { id: 3, name: "Messages" }, // TODO add get messages (Twilio)
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
  const [isEditing, setIsEditing] = useState(false);
  const [currentActive, setCurrentActive] = useState(1); // Id of item
  const router = useRouter();
  const { applicantId, openingId, stageId } = router.query as Pick<
    CUSTOM_QUERY,
    "openingId" | "stageId" | "applicantId"
  >;

  const setApplicantProfileModal = useStore(
    (store) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store) => store.applicantProfileModal
  );

  const { applicant, isApplicantLoading, isApplicantError } =
    useApplicantById(applicantId);

  const handleNavClick = (e, tabId: number) => {
    e.preventDefault();
    setCurrentActive(tabId);
  };

  const handleModalClose = async () => {
    setApplicantProfileModal({
      ...applicantProfileModal,
      isModalOpen: false,
    });
    await delay(700); // TODO This is dumb
    // The SWR hook still runs despite the query string being stripped away from the URL
    // This is essentially a hack to not show a loading state for the user As the modal retracts.
    // TODO refactor this garbage

    router.push(
      {
        pathname: `/openings/${openingId}/stages/${stageId}/applicants`,
      },
      undefined,
      { shallow: true }
    );
  };

  const updateApplicant = async (applicantId: string, changes: {}) => {
    try {
      const { message } = await ApplicantsService.updateApplicant(
        applicantId,
        changes
      );

      alert(message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // TODO NOTE updating that single applicant wont update the applicant list since the list is rendering old data
    mutate(ApplicantsService.getApplicantURL(applicantId));
  };

  return (
    <Transition.Root show={applicantProfileModal.isModalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden "
        onClose={handleModalClose}
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
                      <Dialog.Title className="text-lg font-medium text-dark flex items-center space-x-4">
                        {isApplicantError && "An error ocurred"}
                        {isApplicantLoading && "Loading..."}
                        <EasyEdit
                          placeholder={null}
                          type={Types.TEXT}
                          value={applicant?.firstName}
                          onSave={(
                            value // Only update if there's been a change
                          ) =>
                            value !== applicant?.firstName &&
                            updateApplicant(applicant?.applicantId, {
                              firstName: value,
                              fullName: `${value} ${applicant.lastName}`,
                            })
                          }
                          editComponent={
                            <CustomEditableInput
                              label={"First name"}
                              placeholder={"Enter a new name"}
                              initialValue={applicant?.firstName}
                            />
                          }
                          saveButtonLabel={
                            <CustomEditableAction action="SAVE" />
                          }
                          cancelButtonLabel={
                            <CustomEditableAction action="CANCEL" />
                          }
                          attributes={{ name: "awesome-input", id: 1 }}
                        />
                        <EasyEdit
                          placeholder={null}
                          type={Types.TEXT}
                          value={applicant?.lastName}
                          onSave={(value) =>
                            value !== applicant?.lastName &&
                            updateApplicant(applicant?.applicantId, {
                              lastName: value,
                              fullName: `${applicant.firstName} ${value}`,
                            })
                          }
                          editComponent={
                            <CustomEditableInput
                              label={"Last name"}
                              placeholder={"Enter a new name"}
                              initialValue={applicant?.lastName}
                            />
                          }
                          saveButtonLabel={
                            <CustomEditableAction action="SAVE" />
                          }
                          cancelButtonLabel={
                            <CustomEditableAction action="CANCEL" />
                          }
                          attributes={{ name: "awesome-input", id: 1 }}
                        />
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center space-x-4">
                        <ClickToCopy
                          showText={"Copy Application Link"}
                          copyText={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/${applicant?.orgId}/applicants/${applicant?.applicantId}`}
                        />
                        <button
                          type="button"
                          className="bg-white rounded-md text-red-400 hover:text-red-500 transition ease-in-out duration-200 focus:ring-2 focus:ring-blue-500"
                          onClick={handleModalClose}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="text-md text-light mt-2">
                      {isApplicantError && "An error ocurred"}
                      {isApplicantLoading && "Loading..."}
                      <EasyEdit
                        placeholder={null}
                        type={Types.TEXT}
                        value={applicant?.email}
                        onSave={(value) =>
                          value !== applicant?.email &&
                          updateApplicant(applicant?.applicantId, {
                            email: value,
                          })
                        }
                        editComponent={
                          <CustomEditableInput
                            label={"Email"}
                            placeholder={"Enter a new email"}
                            initialValue={applicant?.email}
                          />
                        }
                        saveButtonLabel={<CustomEditableAction action="SAVE" />}
                        cancelButtonLabel={
                          <CustomEditableAction action="CANCEL" />
                        }
                        attributes={{ name: "awesome-input", id: 1 }}
                      />
                    </p>
                  </div>

                  <div className="border-b border-gray-200  ">
                    <div className="">
                      <nav
                        className="-mb-px flex w-full "
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
                              "text-center w-full cursor-pointer whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg"
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>

                  <div className="p-4 ">
                    {currentActive == 1 ? (
                      <>
                        {/* TODO refactor this to its own component */}
                        {applicant?.responses?.length > 0 ? (
                          <ul className="py-4  space-y-8">
                            {applicant?.responses.map((response) => {
                              return (
                                <div
                                  key={response?.responseId}
                                  className="pl-3 mt-1 h-full relative focus-within:ring-2 focus-within:ring-blue-500"
                                >
                                  <h3 className="text-lg font-semibold text-dark">
                                    <span
                                      className="absolute inset-0"
                                      aria-hidden="true"
                                    />
                                    {response?.questionTitle}
                                  </h3>
                                  {response?.questionDescription && (
                                    <p className="text-md text-light">
                                      {response?.questionDescription}
                                    </p>
                                  )}
                                  <span className=" inline-flex justify-center items-center space-x-1">
                                    <ChevronDoubleRightIcon className="h-3 w-3" />
                                    <p className="text-lg text-normal font-bold line-clamp-2 ">
                                      {response?.questionResponse}
                                    </p>
                                  </span>
                                </div>
                              );
                            })}
                          </ul>
                        ) : (
                          <h1 className="py-4 text-lg text-dark">
                            This applicant has not answered any questions yet!
                          </h1>
                        )}
                      </>
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
