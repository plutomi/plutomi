import { Fragment, useState } from "react";
import EasyEdit, { Types } from "react-easy-edit";
import CustomEditableInput from "./CustomEditableInput";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import CustomEditableAction from "./CustomEditableSave";
import useStore from "../../utils/store";
import { useRouter } from "next/router";
import { mutate } from "swr";
import axios from "axios";
import ClickToCopy from "../ClickToCopy";
import delay from "delay";
import useApplicantById from "../../SWR/useApplicantById";
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
  const { applicant_id, opening_id, stage_id } = router.query;

  const setApplicantProfileModal = useStore(
    (store: PlutomiState) => store.setApplicantProfileModal
  );

  const applicantProfileModal = useStore(
    (store: PlutomiState) => store.applicantProfileModal
  );

  const { applicant, isApplicantLoading, isApplicantError } = useApplicantById(
    applicant_id as string
  );

  const handleNavClick = (e, tabId: number) => {
    e.preventDefault();
    setCurrentActive(tabId);
  };

  const handleModalClose = async () => {
    setApplicantProfileModal({
      ...applicantProfileModal,
      is_modal_open: false,
    });
    await delay(700); // TODO This is dumb
    // The SWR hook still runs despite the query string being stripped away from the URL
    // This is essentially a hack to not show a loading state for the user As the modal retracts.
    // TODO refactor this garbage

    router.push(
      {
        pathname: `/openings/${opening_id}/stages/${stage_id}/applicants`,
      },
      undefined,
      { shallow: true }
    );
  };

  const updateApplicant = async (applicant_id: string, changes: {}) => {
    try {
      const body = {
        updated_applicant: changes,
      };
      const { status, data } = await axios.put(
        `/api/applicants/${applicant_id}`,
        body
      );
      alert(data.message);
    } catch (error) {
      alert(error.response.data.message);
    }

    // TODO NOTE updating that single applicant wont update the applicant list since the list is rendering old data
    mutate(`/api/applicants/${applicant_id}`);
  };

  return (
    <Transition.Root show={applicantProfileModal.is_modal_open} as={Fragment}>
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
                          value={applicant?.first_name}
                          onSave={(
                            value // Only update if there's been a change
                          ) =>
                            value !== applicant?.first_name &&
                            updateApplicant(applicant?.applicant_id, {
                              first_name: value,
                              full_name: `${value} ${applicant.last_name}`,
                            })
                          }
                          editComponent={
                            <CustomEditableInput
                              label={"First name"}
                              placeholder={"Enter a new name"}
                              initialValue={applicant?.first_name}
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
                          value={applicant?.last_name}
                          onSave={(value) =>
                            value !== applicant?.last_name &&
                            updateApplicant(applicant?.applicant_id, {
                              last_name: value,
                              full_name: `${applicant.first_name} ${value}`,
                            })
                          }
                          editComponent={
                            <CustomEditableInput
                              label={"Last name"}
                              placeholder={"Enter a new name"}
                              initialValue={applicant?.last_name}
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
                          copyText={`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/${applicant?.org_id}/applications/${applicant?.applicant_id}`}
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
                          updateApplicant(applicant?.applicant_id, {
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

                  <div className="p-4">
                    {currentActive == 1 ? (
                     <>
                     
                     <h1>Viewing details</h1>
                     {/* TODO refactor this to its own component */}
                     <ul className="py-4 border rounded-md mx-auto ">
            {applicant?.responses.map((response: DynamoApplicantResponse) => {
              return <h1 key={response.}>{JSON.stringify(response)}</h1>
            })}
                     </ul>
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
